import { ActivityType, Collection, Events, TextChannel, REST, Routes, EmbedBuilder } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { configDotenv } from "dotenv";
import SubscriberConfig from "../../base/schemas/SubscriberConfig";
import SubscriberConfigv2 from "../../base/schemas/SubscriberConfigv2";
import axios from "axios";
import { Jetstream } from "@skyware/jetstream";
import { atInfo, getDIDValidity, isValid } from "../../base/utility/atproto";

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

        // Register stream
        const stream = new Jetstream({
            endpoint: "wss://jetstream2.us-east.bsky.network/subscribe",
        });

        stream.on("open", async (event: any) => {
            console.log("Jetstream connected.");
            this.updateStreamDID(stream)
        });

        stream.on("error", async (event: any) => {
            console.error("Something went wrong with the Jetstream\n", event);

            // Register stream
            const _stream = new Jetstream({
                endpoint: "wss://jetstream2.us-east.bsky.network/subscribe",
            });

            _stream.on("open", async (event: any) => {
                console.log("Jetstream connected.");
                this.updateStreamDID(stream)
            });

            _stream.on("error", async (event: any) => {
                console.error("Something went wrong with the Jetstream\n", event);
            });

            this.initJetstream(_stream);
        })

        // Main loop stuff
        this.StatusLoop();
        this.initJetstream(stream);

        //this.rebuildDB();
    }

    async rebuildDB()
    {
        const db = await SubscriberConfig.find({});

        interface IDictionary {
            [index: string]: Object;
        }

        var newDB = {} as IDictionary;
        
        // For every guild
        for (const i in db)
        {
            const props = JSON.parse(db[i].props);

            // Check every channel
            for (const channel in props)
            {
                // And for every user in that channel
                for (const user in props[channel])
                {
                    var did: string;
                    try {
                        // Get and set DID for user
                        await new Promise(async (resolve, reject) => {
                            const timeoutId = setTimeout(() => {
                                reject(new Error(`Timed out request for ${user}`))
                            }, 2000);

                            var didReq;
                            try {
                                didReq = await axios.get(`https://api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${user}`);

                                //console.log(didReq.data.did);
                                did = didReq.data.did;
                            } catch (err) {
                                console.error(err);

                                //@ts-expect-error
                                if (err.response?.status == 400)
                                {
                                    reject(new Error(`Invalid User`));
                                }
                            }

                            clearTimeout(timeoutId);
                            resolve(didReq);
                        });

                    } catch (err) {
                        console.error(err);
                        continue;
                    }

                    newDB[did!] = {
                        ...newDB[did!],
                        [channel]: {
                            message: props[channel][user].message,
                            replies: props[channel][user].replies,
                            embed: props[channel][user].embedProvider,
                            regex: props[channel][user].regex
                        }
                    }

                    console.log(did!);
                }
            }
        }

        console.log(newDB);

        for (const did in newDB)
        {
            if (!await SubscriberConfigv2.exists({ did: did }))
            {
                console.log("Updating database for: " + did);
                await SubscriberConfigv2.create({ did: did, props: newDB[did] });
            }
        }

        console.log("Finished Migrating Database");
    }

    async updateStreamDID(stream: Jetstream)
    {
        const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

        interface IDictionary {
            [index: string]: Object;
        }

        console.log("Updating Stream DIDs");
        try {
            var localCache = {} as IDictionary;
            var dids: string[] = [];

            console.info("Getting Database...");
            const db = await SubscriberConfigv2.find({});
            console.info("Got Database...");

            for (const i in db) {
                const did = db[i].did;

                dids.push(did);
                localCache[did] = db[i].props;

                console.info("Sending request to ATProto for " + did);
                if (!(await getDIDValidity(did)))
                {
                    for (const channel in localCache[did])
                    {
                        const gChannel = this.client.channels.cache.get(channel) as TextChannel;
                        if (gChannel.guild.members.me?.permissionsIn(gChannel).has("SendMessages"))
                        {
                            console.log(`Sending error message for ${did}...`);
                            try {
                                await gChannel.send({
                                    embeds: [new EmbedBuilder()
                                        .setColor("Red")
                                        .setDescription(`❌ Something went wrong with user: \`${did}\` (API error 400).  Please reconnect.`)
                                    ]
                                });
    
                                console.log(`Sent error message for ${did}...`);
                            } catch (err) {
                                const owner = await gChannel.guild.fetchOwner()
                                try {
                                    await owner?.send({
                                        embeds: [new EmbedBuilder()
                                            .setColor("Red")
                                            .setDescription(`❌ Something went wrong with user: \`${did}\` (API error 400).  Please reconnect.`)
                                        ]
                                    });
    
                                    console.log(`Sent error message in DMs for ${did}...`);
                                } catch (err) {
                                    console.error(err);
                                }
                            }
                        }
                    }
    
                    // Delete problematic entry (this will wipe out users who have not transitioned to DID if imported incorrectly from db migration)
                    dids = dids.filter((element) => element !== did);
                    await SubscriberConfigv2.deleteMany({ did: did });
                }

                if (stream.ws?.readyState !== WebSocket.OPEN)
                {
                    stream.start();
                }
                
                await sleep(100);
            }

            console.log(stream.ws?.readyState === WebSocket.OPEN ? "Jetstream Websocket Status: Open" : "Jetstream Websocket Status: Closed");

            console.log("Updating Jetstream \"wantedDids\"...")
            stream.updateOptions({ wantedDids: dids });
            console.log("Successfully updated Jetstream \"wantedDids\"...");
        } catch (err) {
            console.error(err);
        }

        this.updateStreamDID(stream);
    }

    private async initJetstream(stream: Jetstream)
    {
        interface IDictionary {
            [index: string]: Object;
        }
        var list = {} as IDictionary;

        var did: string[] = [];

        const db = await SubscriberConfigv2.find({});

        for (const i in db) {
            did.push(db[i].did);

            list[db[i].did] = db[i].props;
        }

        stream.onCreate("app.bsky.feed.post", async (event) => {
            for (const channel in list[event.did])
            {
                //@ts-expect-error
                const regex = list[event.did][channel].regex == undefined || list[event.did][channel].regex == null ? "" : list[event.did][channel].regex;
                //@ts-expect-error
                const message = list[event.did][channel].message  == undefined || list[event.did][channel].message == null ? "" : list[event.did][channel].message == "" ? list[event.did][channel].message : list[event.did][channel].message + "\n";
                //@ts-expect-error
                const replies = list[event.did][channel].replies == undefined || list[event.did][channel].replies == null ? false : list[event.did][channel].replies;
                //@ts-expect-error
                const embed = list[event.did][channel].embed == undefined || list[event.did][channel].embed == null ? "bskye.app" : list[event.did][channel].embed;

                try {
                    const gChannel = this.client.channels.cache.get(channel) as TextChannel;
                    if (gChannel.guild.members.me?.permissionsIn(gChannel).has("SendMessages"))
                    {
                        //@ts-expect-error
                        var match = regex != "" ? this.toRegExp(regex!).test(event.commit.record.text) : false;
                        var safe: boolean;

                        if (event.commit.record.hasOwnProperty("reply"))
                        {
                            safe = replies;
                        }
                        else
                        {
                            safe = true;
                        }

                        // Exclude for match
                        if (!match && safe) {
                            console.info(`Sending announcement message for ${event.did}...`);
                            try {
                                await gChannel.send(`${message}https://${embed}/profile/${event.did}/post/${event.commit.rkey}`);
                            } catch (err) {
                                const owner = await (await gChannel.guild).fetchOwner()
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
                            console.log(`Sent announcement message for ${event.did}...`);
                        }
                    }
                    else
                    {
                        const owner = await (await gChannel.guild).fetchOwner()
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
            }
        })

        stream.start();
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
}
