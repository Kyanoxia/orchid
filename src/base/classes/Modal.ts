import { ChatInputCommandInteraction, AutocompleteInteraction, ModalSubmitInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import IModal from "../interfaces/IModal";
import CustomClient from "./CustomClient";
import IModalOptions from "../interfaces/IModalOptions";

export default class Modal implements IModal {
    client: CustomClient;
    custom_id: string;
    title: string;
    description: string;
    modal: ModalBuilder;
    cooldown: number;

    constructor(client: CustomClient, options: IModalOptions) {
        this.client = client;
        this.custom_id = options.custom_id;
        this.title = options.title;
        this.description = options.title;
        this.cooldown = options.cooldown;
        this.modal = new ModalBuilder().setTitle(this.title).setCustomId(this.custom_id);
    }

    Execute(interaction: ModalSubmitInteraction): void {
    }

    BuildModal(): any {
    }
}
