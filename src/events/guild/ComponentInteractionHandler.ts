import { AnySelectMenuInteraction, ButtonInteraction, ContainerBuilder, Events,  MessageComponentInteraction, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import ComponentInteraction from "src/base/classes/ComponentInteraction";
import CustomClient from "src/base/classes/CustomClient";
import Event from "src/base/classes/Event";

export default class CommandHandler extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.InteractionCreate,
            description: "Component Interaction Handler Event",
            once: false
        })
    }

    async Execute(interaction: MessageComponentInteraction | ButtonInteraction | AnySelectMenuInteraction) {
        if (!interaction.isButton() && !interaction.isAnySelectMenu()) return;

        const componentInteraction: ComponentInteraction | undefined = this.client.componentInteractions.get(interaction.customId);

        if (!componentInteraction) {
            this.client.componentInteractions.delete(interaction.customId);
            return;
        }

        console.info(`Called component interaction "${interaction.customId}" by ${interaction.user.username} (${interaction.user.id}) in ${interaction.guildId} / ${interaction.channelId} / ${interaction.message.id}`);

        return componentInteraction.Execute(interaction);
    }
}
