import { ApplicationCommandType } from "discord.js";
import Category from "../enums/Category";
import Contexts from "../enums/Contexts";
import ComponentInteraction from "../classes/ComponentInteraction";

export default interface ICommandOptions {
    name: string;
    description: string;
    type: ApplicationCommandType;
    category: Category;
    options: object;
    default_member_permissions: bigint;
    contexts: Contexts[];
    cooldown: number;
    nsfw: boolean;
}
