import { ActivityType, Collection, Events, TextChannel, REST, Routes } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { configDotenv } from "dotenv";
import SubscriberConfig from "../../base/schemas/SubscriberConfig";
import axios from "axios";

export default class Ready extends Event {
    constructor(client: CustomClient)
    {
        super(client, {
            name: Events.ClientReady,
            description: "Ready Event",
            once: true
        })
    }

    async Execute() {
        configDotenv();

        console.log(`[LOG // SUCCESS] ${this.client.user?.tag} is now ready!`);

        const clientID = this.client.developmentMode ? process.env.devDiscordClientID : process.env.discordClientID;
        const rest = new REST().setToken(process.env.token);

        if (!this.client.developmentMode) {
            const globalCommands: any = await rest.put(Routes.applicationCommands(clientID), {
                body: this.GetJson(this.client.commands.filter(command => !command.dev))
            });

            console.log(`[LOG // SUCCESS] Successfully set ${globalCommands.length} Global Application (/) Commands`)
        }

        const devCommands: any = await rest.put(Routes.applicationGuildCommands(clientID, process.env.devGuildID), {
            body: this.GetJson(this.client.commands.filter(command => command.dev))
        });

        console.log(`[LOG // SUCCESS] Successfully set ${devCommands.length} Developer Application (/) Commands`)

        this.client.user?.setPresence({
            activities: [{
                name: `${this.client.guilds.cache.size} guilds...`,
                type: ActivityType.Watching,
            }]
        })

        setInterval(() => {
            this.StartScanning();
        }, 10000);
    }

    private GetJson(commands: Collection<string, Command>): object[] {
        const data: object[] = [];

        commands.forEach(command => {
            data.push({
                name: command.name,
                description: command.description,
                options: command.options,
                default_member_permissions: command.default_member_permissions.toString(),
                dm_permission: command.global_permission,
                integration_types: command.global_permission ? [0, 1] : [0],
                contexts: command.global_permission ? [0, 1, 2] : [0]
            })
        });

        return data;
    }

    private async StartScanning() {
        const db = await SubscriberConfig.find({});
        db.forEach(async (element) => {
            const props = JSON.parse(element.props);
            const guild = element.guildID;

            const guilds = Array.from(this.client.guilds.cache.map(guild => guild.id));

            var postTime: string;

            // Delete document if we aren't in the guild anymore
            if (!guilds.includes(guild))
            {
                console.log(`[LOG // STATUS] No longer in guild ${guild}. Deleting document...`)
                SubscriberConfig.deleteMany({ guildID: guild }).catch();
                return;
            }

            for (var channel in props)
            {
                for (var user in props[channel])
                {
                    const message = props[channel][user].message;

                    const posts = await axios.get(`https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${user}&filter=posts_no_replies`);
                    for (const element of posts.data.feed)
                    {
                        if (element.post.author.handle == user)
                        {
                            const post = element.post;
                            const postHead = post.uri.split("post/").pop();

                            postTime = post.indexedAt.replace(/[^0-9]/g, '');

                            if (props[channel][user].indexedAt < postTime)
                            {
                                props[channel][user].indexedAt = postTime;
                                (this.client.channels.cache.get(channel) as TextChannel).send(`${message}\nhttps://fxbsky.app/profile/${post.author.handle}/post/${postHead}`);
                                SubscriberConfig.updateOne({ guildID: guild }, { $set: { 'props': JSON.stringify(props) }, $currentDate: { lastModified: true } }).catch();
                            }
                        }
                    }
                }
            }
        });
    }
}
