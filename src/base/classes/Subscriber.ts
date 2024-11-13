import ISubscriber from "../interfaces/iSubscriber";

export default class Subscriber implements ISubscriber {
    guild: string;
    channel: string;
    username: string;
    message: string;
    indexedAt: number;
    embedProvider: string;
    replies: boolean;
    regex: string;

    constructor(guild: string, channel: string, username: string, message: string, indexedAt: number, embedProvider: string, replies: boolean, regex: string) {
        this.guild = guild;
        this.channel = channel;
        this.username = username;
        this.message = message;
        this.indexedAt = indexedAt;
        this.embedProvider = embedProvider;
        this.replies = replies;
        this.regex = regex;
    }

    Init(): void {
        console.info(this.guild);
        console.info(this.channel);
        console.info(this.username);
        console.info(this.message);
        console.info(this.embedProvider);
        console.info(this.replies);
        console.info(this.regex);
    }

    toJSON(): object[] {
        const channel = this.channel;
        const username = this.username;
        const message = this.message;
        const indexedAt = this.indexedAt;
        const embedProvider = this.embedProvider;
        const replies = this.replies;
        const regex = this.regex;

        var json: any = {
            [channel]:
            {
                [username]:
                {
                    message: message,
                    indexedAt: indexedAt,
                    embedProvider: embedProvider,
                    replies: replies,
                    regex: regex
                }
            }
        }

        return json;
    }
}
