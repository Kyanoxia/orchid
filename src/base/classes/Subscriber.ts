import { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import ISubscriber from "../interfaces/iSubscriber";

export default class Subscriber implements ISubscriber {
    guild: string;
    channel: string;
    username: string;
    message: string;

    constructor(guild: string, channel: string, username: string, message: string) {
        this.guild = guild;
        this.channel = channel;
        this.username = username;
        this.message = message;
    }

    Init(): void {
        console.log("[LOG // STATUS] ", this.guild);
        console.log("[LOG // STATUS] ", this.channel);
        console.log("[LOG // STATUS] ", this.username);
        console.log("[LOG // STATUS] ", this.message);
    }

    toJSON(): object[] {
        const channel = this.channel;
        const username = this.username;
        const message = this.message;

        var json: any = {
            [channel]:
            {
                [username]:
                {
                    message: message
                }
            }
        }

        return json;
    }
}
