import { ActivityType, Collection, Events, TextChannel, REST, Routes, EmbedBuilder } from "discord.js";
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

        console.log(`Success: ${this.client.user?.tag} is now ready!`);

        const clientID = process.env.discordClientID;
        const rest = new REST().setToken(process.env.token);

        // Register commands
        const globalCommands: any = await rest.put(Routes.applicationCommands(clientID), {
            body: this.GetJson(this.client.commands.filter(command => !command.dev))
        });

        console.log(`Success: Successfully set ${globalCommands.length} Global Application (/) Commands`)

        // Register Dev Commands
        if (this.client.developmentMode)
        {
            const devCommands: any = await rest.put(Routes.applicationGuildCommands(clientID, process.env.devGuildID), {
                body: this.GetJson(this.client.commands.filter(command => command.dev))
            });
    
            console.log(`Success: Successfully set ${devCommands.length} Developer Application (/) Commands`)
        }

        // Main loop stuff
        this.StatusLoop();
        this.StartScanning();
    }

    // Helper function for commands
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

        console.info(`Success: Set new status to: Watching ${this.client.guilds.cache.size} guilds...`);

        await sleep(60000);

        this.StatusLoop();
    }

    // String to regex
    private toRegExp(string: string): RegExp {
        try {
            const match = string.match(/^\/((?:\\.|[^\\])*)\/(.*)$/);
            const exp = match![1];
            const arg = match![2];

            return new RegExp(exp, arg);
        } catch (err) {
            throw "Error while creating RegExp: " + err;
        }
    }

    private async StartScanning() {
        const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

        try {
            console.log(`Getting Mongo Database...`);
            const db = await SubscriberConfig.find({});
            console.log(`Got Mongo Database...`);
        
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
                    console.info(`No longer in guild ${guild}. Deleting document...`);
                    try {
                        console.log(`Deleting Guild Entry: ${guild}...`);
                        await SubscriberConfig.deleteMany({ guildID: guild });
                        console.log(`Deleted Guild Entry: ${guild}`);
                    } catch (err) {
                        console.error(err);
                    }
                    continue;
                }

                for (const channel in props)
                {
                    for (const user in props[channel])
                    {
                        var message = props[channel][user].message;
                        var regex = props[channel][user].regex;
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
                            console.info(`Sending request for ${user}...`);

                            try {
                                var posts;

                                try {
                                    posts = await new Promise(async (resolve, reject) => {
                                        const timeoutId = setTimeout(() => {
                                            reject(new Error(`Timed out request for ${user}`))
                                        }, 2000);

                                        var value;
                                        try {
                                            value = await axios.get(`https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${user}${filterReplies}`);
                                            if (value.status == 400)
                                            {
                                                const gChannel = this.client.channels.cache.get(channel) as TextChannel;
                                                if (gChannel.guild.members.me?.permissionsIn(gChannel).has("SendMessages"))
                                                {
                                                    console.log(`Sending error message for ${user}...`);
                                                    try {
                                                        await gChannel.send({
                                                            embeds: [new EmbedBuilder()
                                                                .setColor("Red")
                                                                .setDescription(`❌ Something went wrong with user: \`${user}\` (API error 400).  Please reconnect.`)
                                                            ]
                                                        });
                                                    } catch (err) {
                                                        const owner = await (await this.client.guilds.fetch(guild)).fetchOwner()
                                                        try {
                                                            await owner?.send({
                                                                embeds: [new EmbedBuilder()
                                                                    .setColor("Red")
                                                                    .setDescription(`❌ Something went wrong with user: \`${user}\` (API error 400).  Please reconnect.`)
                                                                ]
                                                            });
                                                        } catch (err) {
                                                            console.error(err);
                                                        }
                                                    }
                                                    console.log(`Sent error message for ${user}...`);
                                                }

                                                // Delete problematic entry immediately, we do NOT need it.
                                                delete props[channel][user];

                                                // Delete the whole channel if it's empty
                                                if (Object.keys(props[channel]).length == 0)
                                                {
                                                    delete props[channel];
                                                }

                                                try {
                                                    console.info(`Updating database for ${guild}...`);
                                                    await SubscriberConfig.updateOne({ guildID: guild }, { $set: { 'props': JSON.stringify(props) }, $currentDate: { lastModified: true } });
                                                    console.log(`Updated Database for ${guild}`);
                                                } catch (err) {
                                                    console.error(err);
                                                }
                                            }
                                        } catch (err) {
                                            console.error(`Axios responded with: ${err}`);
                                        }

                                        clearTimeout(timeoutId);
                                        resolve(value);
                                    });
                                } catch (err) {
                                    console.error(err);
                                    continue;
                                }

                                console.log(`Got response from ${user}...`);

                                //@ts-expect-error
                                for (const element of posts.data.feed)
                                {
                                    if (element.post.author.handle == user || element.post.author.did == user)
                                    {
                                        const post = element.post;
                                        const postHead = post.uri.split("post/").pop();
    
                                        console.log(`Got recent post from: ${element.post.author.handle}`);
    
                                        postTime = post.indexedAt.replace(/[^0-9]/g, '');
    
                                        if (props[channel][user].indexedAt < postTime)
                                        {
                                            props[channel][user].indexedAt = postTime;
                                            try {
                                                const gChannel = this.client.channels.cache.get(channel) as TextChannel;
                                                if (gChannel.guild.members.me?.permissionsIn(gChannel).has("SendMessages"))
                                                {
                                                    console.info(`Sending announcement message for ${user}...`);

                                                    // If regex is empty then we aren't matching anything (duh)
                                                    // We already sanitized during the connect process, so we don't need to check here
                                                    regex = regex != null ? regex : "";
                                                    var match = regex != "" ? this.toRegExp(regex!).test(post.record.text) : false;

                                                    // Exclude for match
                                                    if (!match) {
                                                        try {
                                                            await gChannel.send(`${message}https://${props[channel][user].embedProvider}/profile/${post.author.handle}/post/${postHead}`);
                                                        } catch (err) {
                                                            const owner = await (await this.client.guilds.fetch(guild)).fetchOwner()
                                                            try {
                                                                await owner?.send({
                                                                    embeds: [new EmbedBuilder()
                                                                        .setColor("Red")
                                                                        .setDescription("❌ Skycord tried to send an announcement but something went wrong!  Please make sure Skycord has necessary permissions, and try again.")
                                                                    ]
                                                                });
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                        }
                                                        console.log(`Sent announcement message for ${user}...`);
                                                    }
                                                }
                                                else
                                                {
                                                    const owner = await (await this.client.guilds.fetch(guild)).fetchOwner()
                                                    try {
                                                        await owner?.send({
                                                            embeds: [new EmbedBuilder()
                                                                .setColor("Red")
                                                                .setDescription("❌ Skycord tried to send an announcement but it doesn't have permission!  Please make sure Skycord has necessary permissions, and try again.")
                                                            ]
                                                        });
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                }
                                            } catch (err) {
                                                console.error(err);
                                            }
    
                                            try {
                                                console.info(`Updating database for ${guild}...`);
                                                await SubscriberConfig.updateOne({ guildID: guild }, { $set: { 'props': JSON.stringify(props) }, $currentDate: { lastModified: true } });
                                                console.log(`Updated Database for ${guild}`);
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }
    
                                        break;
                                    }
                                }
                            } catch (err) {
                                console.error(err)
                            }
                        } catch (err) {
                            console.error(`Something went wrong fetching API data, but we'll try again on the next pass...`);
                        }
                        
                        await sleep(60);
                    }
                }
            }

        } catch (err) {
            console.error(err);
        }

        console.log(`Calling new loop...`);
        this.StartScanning();
    }
}
