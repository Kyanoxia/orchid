import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, MessageContextMenuCommandInteraction, ModalBuilder, ModalSubmitInteraction, StringSelectMenuInteraction, UserContextMenuCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface IModal {
    client: CustomClient;
    custom_id: string;
    title: string;
    description: string;
    modal: ModalBuilder;
    cooldown: number;

    Execute(interaction: ModalSubmitInteraction | ButtonInteraction | StringSelectMenuInteraction): void;
    BuildModal(): ModalBuilder;
}
