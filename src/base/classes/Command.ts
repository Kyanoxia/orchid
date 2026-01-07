import { ChatInputCommandInteraction, AutocompleteInteraction, ApplicationCommandType, UserContextMenuCommandInteraction, MessageContextMenuCommandInteraction } from "discord.js";
import Category from "../enums/Category";
import ICommand from "../interfaces/ICommand";
import CustomClient from "./CustomClient";
import ICommandOptions from "../interfaces/ICommandOptions";
import Contexts from "../enums/Contexts";
import ComponentInteraction from "./ComponentInteraction";

export default class Command implements ICommand {
    client: CustomClient;
    name: string;
    description: string;
    category: Category;
    type: ApplicationCommandType;
    options: object;
    default_member_permissions: bigint;
    contexts: Contexts[];
    cooldown: number;
    nsfw: boolean;

    constructor(client: CustomClient, options: ICommandOptions) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.category = options.category;
        this.type = options.type;
        this.options = options.options;
        this.default_member_permissions = options.default_member_permissions;
        this.contexts = options.contexts;
        this.cooldown = options.cooldown;
        this.nsfw = options.nsfw;
    }

    Execute(interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction): void {
    }
    AutoComplete(interaction: AutocompleteInteraction): void {
    }
    Panic(interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction): void {
        if (interaction.replied || interaction.deferred) {
            interaction.followUp("ERROR")
        }
        else {
            interaction.reply("ERROR");
        }
    }
}
