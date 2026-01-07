import { ApplicationCommandType, AutocompleteInteraction, ChatInputCommandInteraction, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";
import Category from "../enums/Category";
import Contexts from "../enums/Contexts";
import ComponentInteraction from "../classes/ComponentInteraction";

export default interface ICommand {
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

    Execute(interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction): void;
    AutoComplete(interaction: AutocompleteInteraction): void;
}
