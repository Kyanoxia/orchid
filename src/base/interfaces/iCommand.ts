import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";
import Category from "../enums/Category";

export default interface ICommand {
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

    Execute(Interaction: ChatInputCommandInteraction): void;
    AutoComplete(Interaction: AutocompleteInteraction): void;
}
