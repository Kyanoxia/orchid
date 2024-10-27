import ISubscriber from "../interfaces/iSubscriber";

export default class Subscriber implements ISubscriber {
    guild: string;
    channel: string;
    username: string;
    message: string;
    indexedAt: number;
    embedProvider: string;
    replies: boolean;

    constructor(guild: string, channel: string, username: string, message: string, indexedAt: number, embedProvider: string, replies: boolean) {
        this.guild = guild;
        this.channel = channel;
        this.username = username;
        this.message = message;
        this.indexedAt = indexedAt;
        this.embedProvider = embedProvider;
        this.replies = replies;
    }

    Init(): void {
        console.log("[LOG // STATUS] ", this.guild);
        console.log("[LOG // STATUS] ", this.channel);
        console.log("[LOG // STATUS] ", this.username);
        console.log("[LOG // STATUS] ", this.message);
        console.log("[LOG // STATUS] ", this.embedProvider);
        console.log("[LOG // STATUS] ", this.replies);
    }

    toJSON(): object[] {
        const channel = this.channel;
        const username = this.username;
        const message = this.message;
        const indexedAt = this.indexedAt;
        const embedProvider = this.embedProvider;
        const replies = this.replies;

        var json: any = {
            [channel]:
            {
                [username]:
                {
                    message: message,
                    indexedAt: indexedAt,
                    embedProvider: embedProvider,
                    replies: replies
                }
            }
        }

        return json;
    }
}
