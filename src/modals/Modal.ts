import { ActionRowBuilder, ChatInputCommandInteraction, ContainerBuilder, ModalBuilder, ModalSubmitInteraction, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Modal from "src/base/classes/Modal";
import CustomClient from "src/base/classes/CustomClient";
import IModalOptions from "src/base/interfaces/IModalOptions";

export default class TestModal extends Modal {
    constructor(client: CustomClient, options: IModalOptions) {
        super(client, {
            custom_id: "testModal",
            title: "Modal Builder",
            cooldown: 3
        })
    }

    BuildModal(): ModalBuilder {
        const favoriteColorInput = new TextInputBuilder()
            .setCustomId('email')
            .setLabel("What's your email address?")
            .setStyle(TextInputStyle.Short);

        const hobbiesInput = new TextInputBuilder()
            .setCustomId('reasons')
            .setLabel("Reason for applying:")
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(favoriteColorInput);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(hobbiesInput);
        
        this.modal.addComponents(firstActionRow, secondActionRow);

        return this.modal;
    }

    async Execute(interaction: ModalSubmitInteraction) {
        const shardId = interaction.guild?.shardId;

        const email = interaction.fields.getTextInputValue("email");
        const reasons = interaction.fields.getTextInputValue("reasons");

        interaction.reply({
            flags: "IsComponentsV2",
            components: [
                new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# Moderation Application`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${interaction.user.globalName} Has just applied to be a moderator.`),
                    new TextDisplayBuilder().setContent(`**Email:**\n\`\`\`\n${email}\n\`\`\``),
                    new TextDisplayBuilder().setContent(`**Reason:**\n${reasons}`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`-# Command run by <@${interaction.user.id}> at <t:${Math.round(interaction.createdTimestamp / 1000)}:T>`)
                )
                
            ]
        });
    }
}
