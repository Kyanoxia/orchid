import { ActivityType, Collection, Events, TextChannel, REST, Routes, EmbedBuilder, GuildMember } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { configDotenv } from "dotenv";
import SubscriberConfig from "../../base/schemas/SubscriberConfig";
import axios from "axios";
import { Callback } from "mongoose";

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

        const clientID = process.env.discordClientID;
        const rest = new REST().setToken(process.env.token);

        const globalCommands: any = await rest.put(Routes.applicationCommands(clientID), {
            body: this.GetJson(this.client.commands.filter(command => !command.dev))
        });

        console.log(`[LOG // SUCCESS] Successfully set ${globalCommands.length} Global Application (/) Commands`)

        if (this.client.developmentMode)
        {
            const devCommands: any = await rest.put(Routes.applicationGuildCommands(clientID, process.env.devGuildID), {
                body: this.GetJson(this.client.commands.filter(command => command.dev))
            });
    
            console.log(`[LOG // SUCCESS] Successfully set ${devCommands.length} Developer Application (/) Commands`)
        }

        this.StatusLoop();
        this.StartScanning();
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

    private async StatusLoop() {
        const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

        this.client.user?.setPresence({
            activities: [{
                name: `${this.client.guilds.cache.size} guilds...`,
                type: ActivityType.Watching,
            }]
        })

        console.log(`[LOG // STATUS] Set new status to: Watching ${this.client.guilds.cache.size} guilds...`);

        await sleep(60000);

        this.StatusLoop();
    }

    private async StartScanning() {
        const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

        try {
            console.log(`[LOG // DEBUG] Getting Mongo Database...`);
            const db = await SubscriberConfig.find({});
            console.log(`[LOG // DEBUG] Got Mongo Database...`);
        
            for (const i in db)
            {
                const props = JSON.parse(db[i].props);
                const guild = db[i].guildID;

                const guilds = Array.from(this.client.guilds.cache.map(guild => guild.id));

                var postTime: string;
                var embedProvider: string;
                var replies: boolean;

                // Delete document if we aren't in the guild anymore
                if (!guilds.includes(guild))
                {
                    console.log(`[LOG // STATUS] No longer in guild ${guild}. Deleting document...`);
                    try {
                        console.log(`[LOG // DEBUG] Deleting Guild Entry: ${guild}...`);
                        await SubscriberConfig.deleteMany({ guildID: guild });
                        console.log(`[LOG // DEBUG] Deleted Guild Entry: ${guild}`);
                    } catch (err) {
                        console.error(`[LOG // ERROR] ${err}`);
                    }
                    continue;
                }

                for (const channel in props)
                {
                    for (const user in props[channel])
                    {
                        var message = props[channel][user].message;
                        const filterReplies: string = props[channel][user].replies ? "" : "&filter=posts_no_replies";

                        replies = Object.keys(props[channel][user]).includes('replies') ? props[channel][user].replies : false;
                        embedProvider = Object.keys(props[channel][user]).includes('embedProvider') ? props[channel][user].embedProvider : "bsky.app";

                        props[channel][user].replies = replies;
                        props[channel][user].embedProvider = embedProvider;

                        if (message != "")
                        {
                            message = message + "\n";
                        }

                        try {
                            console.log(`[LOG // DEBUG] Sending request for ${user}...`);

                            try {
                                const posts = await new Promise((resolve, reject) => {
                                    const timeoutId = setTimeout(() => {
                                        reject(new Error(`Timed out request for ${user}`))
                                    }, 2000)
                                  
                                    axios.get(`https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${user}${filterReplies}`).then(value => {
                                        clearTimeout(timeoutId);
                                        resolve(value);
                                    });
                                });

                                console.log(`[LOG // DEBUG] Got response from ${user}...`);

                                //@ts-expect-error
                                for (const element of posts.data.feed)
                                {
                                    if (element.post.author.handle == user)
                                    {
                                        const post = element.post;
                                        const postHead = post.uri.split("post/").pop();
    
                                        console.log(`[LOG // DEBUG] Just got recent post from: ${element.post.author.handle}`);
    
                                        postTime = post.indexedAt.replace(/[^0-9]/g, '');
    
                                        if (props[channel][user].indexedAt < postTime)
                                        {
                                            props[channel][user].indexedAt = postTime;
                                            try {
                                                const gChannel = this.client.channels.cache.get(channel) as TextChannel;
                                                if (gChannel.guild.members.me?.permissionsIn(gChannel).has("SendMessages"))
                                                {
                                                    console.log(`[LOG // DEBUG] Sending announcement message for ${user}...`);
                                                    await gChannel.send(`${message}https://${props[channel][user].embedProvider}/profile/${post.author.handle}/post/${postHead}`);
                                                    console.log(`[LOG // DEBUG] Sent announcement message for ${user}...`);
                                                }
                                                else
                                                {
                                                    const owner = await (await this.client.guilds.fetch(guild)).fetchOwner()
                                                    await owner?.send({
                                                        embeds: [new EmbedBuilder()
                                                            .setColor("Red")
                                                            .setDescription("❌ Skycord tried to send an announcement but it received an invalid response!  Please make sure Skycord has permission to send messages in your channel, and try again.")
                                                        ]
                                                    });
                                                }
                                            } catch (err) {
                                                console.error(`[LOG // ERROR] ${err}`);
                                            }
    
                                            try {
                                                console.log(`[LOG // DEBUG] Updating database for ${guild}...`);
                                                await SubscriberConfig.updateOne({ guildID: guild }, { $set: { 'props': JSON.stringify(props) }, $currentDate: { lastModified: true } });
                                                console.log(`[LOG // DEBUG] Updated Database for ${guild}`);
                                            } catch (err) {
                                                console.error(`[LOG // ERROR] ${err}`);
                                            }
                                        }
    
                                        break;
                                    }
                                }
                            } catch (err) {
                                console.error(`[LOG // ERROR] ${err}`)
                            }
                        } catch (err) {
                            console.error(`[LOG // ERROR] Something went wrong fetching API data, but we'll try again on the next pass...`);
                        }
                        
                        await sleep(60);
                    }
                }
            }

        } catch (err) {
            console.error(err);
        }

        console.log(`[LOG // DEBUG] Calling new loop...`);
        this.StartScanning();
    }
}
