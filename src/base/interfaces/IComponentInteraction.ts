import { AnySelectMenuInteraction, ButtonInteraction, ChatInputCommandInteraction, ComponentType, MessageComponentInteraction, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface IComponentInteraction {
    client: CustomClient;
    name: string;
    description: string;
    type: ComponentType;

    Execute(interaction: MessageComponentInteraction | ButtonInteraction | AnySelectMenuInteraction): void;
}
