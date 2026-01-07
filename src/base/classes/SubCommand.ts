import { ChatInputCommandInteraction } from "discord.js";
import ISubCommand from "../interfaces/ISubCommand";
import CustomClient from "./CustomClient";
import ISubCommandOptions from "../interfaces/ISubCommandOptions";
import ComponentInteraction from "./ComponentInteraction";

export default class SubCommand implements ISubCommand {
    client: CustomClient;
    name: string;

    constructor(client: CustomClient, options: ISubCommandOptions) {
        this.client = client;
        this.name = options.name;
    }

    Execute(interaction: ChatInputCommandInteraction): void {
    }
    Panic(interaction: ChatInputCommandInteraction): void {
        if (interaction.replied || interaction.deferred) {
            interaction.followUp("ERROR")
        }
        else {
            interaction.reply("ERROR");
        }
    }
}
