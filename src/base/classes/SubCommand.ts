import { ChatInputCommandInteraction } from "discord.js";
import ISubCommand from "../interfaces/iSubCommand";
import CustomClient from "./CustomClient";
import ISubCommandOptions from "../interfaces/iSubCommandOptions";

export default class SubCommand implements ISubCommand {
    client: CustomClient;
    name: string;

    constructor(client: CustomClient, options: ISubCommandOptions) {
        this.client = client;
        this.name = options.name;
    }

    Execute(Interaction: ChatInputCommandInteraction): void {
    }

}
