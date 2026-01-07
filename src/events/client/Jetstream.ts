import { Events, TextChannel } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import { Jetstream, CommitType } from "@skyware/jetstream";
import { Account } from "src/databases/orchid/entities/account.entity";

export default class Ready extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.ClientReady,
            description: "Jetstream Loop",
            once: true
        })
    }

    async Execute() {
        console.log("Starting Jetstream...");

        const jetstream = new Jetstream();
        jetstream.start();

        jetstream.on('open', () => {
            console.log(`Jetstream opened successfully`);
        });

        jetstream.on('error', (error: any) => {
            console.error(`An error occurred with the Jetstream!\n${error}`);
        });

        jetstream.on('close', () => {
            console.log(`The Jetstream was closed`);
        });

        jetstream.on('commit', async (event) => {
            if (event.commit.operation === CommitType.Create && event.commit.collection === 'app.bsky.feed.post') {
                this.CheckAndAnnounce(event);
            };
        })
    }

    async CheckAndAnnounce(event: any) {
        const db = this.client.databases.get("Orchid V2");
        if (!db) {
            console.error("No database found to check record in");
            return;
        }

        const fork = db.em.fork();
        const acc = await fork.findOne(Account, { did: event.did }, { populate: ['announcements'] });

        if (!acc) return;

        for (const announcement of acc.announcements) {
            const gChannel = await this.client.channels.fetch(announcement.channel.toString()) as TextChannel;

            await gChannel.send(`${announcement.message ?? ""}\nhttps://bsky.app/profile/${event.did}/post/${event.commit.rkey}`)
        }
    }
}
