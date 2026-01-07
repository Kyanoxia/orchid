import { ComponentType, MessageComponentInteraction, ButtonInteraction, AnySelectMenuInteraction, MessageFlags, ActionRowBuilder, ButtonBuilder, ChannelSelectMenuBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, StringSelectMenuBuilder, TextDisplayBuilder, StringSelectMenuComponent } from "discord.js";
import ComponentInteraction from "src/base/classes/ComponentInteraction";
import CustomClient from "src/base/classes/CustomClient";

export default class Next extends ComponentInteraction {
    constructor(client: CustomClient) {
        super(client, {
            name: "next",
            description: "Next button",
            type: ComponentType.Button
        })
    }

    async Execute(interaction: MessageComponentInteraction | ButtonInteraction | AnySelectMenuInteraction) {
        interaction.deferUpdate();
    }
}
