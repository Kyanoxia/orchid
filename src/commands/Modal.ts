import { ApplicationCommandType, MessageContextMenuCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "src/base/classes/Command";
import CustomClient from "src/base/classes/CustomClient";
import Category from "src/base/enums/Category";
import Contexts from "src/base/enums/Contexts";

export default class Modal extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "modal",
            description: "Display a test modal",
            type: ApplicationCommandType.Message,
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            contexts: [Contexts.Guild],
            nsfw: false,
            cooldown: 3,
            options: [],
        })
    }

    async Execute(interaction: MessageContextMenuCommandInteraction) {
        const modal = this.client.modals.get("testModal")?.BuildModal();

        interaction.showModal(modal!);
    }
}
