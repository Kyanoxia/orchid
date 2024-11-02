import { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import Category from "../enums/Category";
import ICommand from "../interfaces/iCommand";
import CustomClient from "./CustomClient";
import ICommandOptions from "../interfaces/iCommandOptions";

export default class Command implements ICommand {
    client: CustomClient;
    name: string;
    description: string;
    category: Category;
    options: object;
    default_member_permissions: bigint;
    global_permission: boolean;
    cooldown: number;
    dev: boolean;
    ephemeral: boolean;

    constructor(client: CustomClient, options: ICommandOptions) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.category = options.category;
        this.options = options.options;
        this.default_member_permissions = options.default_member_permissions;
        this.global_permission = options.global_permission;
        this.cooldown = options.cooldown;
        this.dev = options.dev;
        this.ephemeral = options.ephemeral;
    }

    Execute(Interaction: ChatInputCommandInteraction): void {
    }
    AutoComplete(Interaction: AutocompleteInteraction): void {
    }

}
