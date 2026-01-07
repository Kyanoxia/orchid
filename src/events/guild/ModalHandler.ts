import { ChatInputCommandInteraction, Collection, EmbedBuilder, Events, ModalSubmitInteraction } from "discord.js";
import Command from "src/base/classes/Command";
import CustomClient from "src/base/classes/CustomClient";
import Event from "src/base/classes/Event";
import Modal from "src/base/classes/Modal";

export default class ModalHandler extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.InteractionCreate,
            description: "Modal Handler Event",
            once: false
        })
    }

    Execute(interaction: ModalSubmitInteraction) {
        if (!interaction.isModalSubmit()) return;

        const modal: Modal = this.client.modals.get(interaction.customId)!;

        console.info(`Called modal ${interaction.customId} by ${interaction.user.username} (${interaction.user.id}) in ${interaction.guildId} / ${interaction.channelId}`);

        if (!modal) {
            interaction.reply({ content: "This modal does not exist!", ephemeral: true });
            console.error(`Command ${interaction.customId} does not exist in ${interaction.guildId} / ${interaction.channelId}`);
            this.client.commands.delete(interaction.customId);
        }

        const { cooldowns } = this.client;
        if (!cooldowns.has(modal.custom_id)) {
            cooldowns.set(modal.custom_id, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(modal.custom_id)!;

        const cooldownAmount = (modal.cooldown || 3) * 1000;

        if (timestamps.has(interaction.user.id) && (now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount)) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`❌ Please Wait another ${((((timestamps.get(interaction.user.id) || 0) + cooldownAmount) - now) / 1000).toFixed(1)} seconds to run this command again!`)
            ], ephemeral: true })
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            return this.client.modals.get(modal.custom_id)?.Execute(interaction);
        } catch (err) {
            console.error(err);
        }
    }
}
