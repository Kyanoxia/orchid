import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, ChannelSelectMenuBuilder, ChannelType, ChatInputCommandInteraction, ComponentType, ContainerBuilder, Message, MessageFlags, ModalBuilder, ModalSubmitInteraction, SeparatorBuilder, SeparatorSpacingSize, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Modal from "src/base/classes/Modal";
import CustomClient from "src/base/classes/CustomClient";
import IModalOptions from "src/base/interfaces/IModalOptions";

export default class ConnectModal extends Modal {
    constructor(client: CustomClient, options: IModalOptions) {
        super(client, {
            custom_id: "account",
            title: "Connect Account",
            cooldown: 3
        })
    }

    BuildModal(): ModalBuilder {
        const accountInput = new TextInputBuilder()
            .setCustomId('account')
            .setLabel("Account to connect")
            .setStyle(TextInputStyle.Short);

        const messageInput = new TextInputBuilder()
            .setCustomId('message')
            .setLabel("Announcement message")
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(accountInput);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput);

        this.modal.addComponents(firstActionRow, secondActionRow);

        return this.modal;
    }

    async Execute(interaction: ModalSubmitInteraction) {
        const account = interaction.fields.getTextInputValue("account");
        const message = interaction.fields.getTextInputValue("message");

        let postTypes: String[];
        let channel: Channel | null;

        const typeSelect = new StringSelectMenuBuilder()
            .setCustomId("types")
            .setPlaceholder("Choose what to announce")
            .setMinValues(1)
            .setMaxValues(4)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Original Posts")
                    .setDescription("Original posts that don't interact with anyone")
                    .setValue("posts"),

                new StringSelectMenuOptionBuilder()
                    .setLabel("Replies")
                    .setDescription("Replies to posts")
                    .setValue("replies"),

                new StringSelectMenuOptionBuilder()
                    .setLabel("Reposts")
                    .setDescription("Reposts of your own posts or others' posts")
                    .setValue("reposts"),

                new StringSelectMenuOptionBuilder()
                    .setLabel("Quote Posts")
                    .setDescription("Quote Reposts")
                    .setValue("quotes")
            );

        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("channels")
            .setPlaceholder("Choose where to announce")
            .setChannelTypes(ChannelType.AnnouncementThread, ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildMedia);

        const confirm = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Continue')
            .setStyle(ButtonStyle.Secondary);

        const response = await interaction.reply({
            flags: ["IsComponentsV2", MessageFlags.Ephemeral],
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`### Connect an Account`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`Connecting account **${account}**`),
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`### Message:\n${message}`)
                    )
                    .addActionRowComponents(
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(typeSelect)
                    )
                    .addActionRowComponents(
                        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelect)
                    )
                    .addActionRowComponents(
                        new ActionRowBuilder<ButtonBuilder>().addComponents(confirm)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`-# Command run by <@${interaction.user.id}> at <t:${Math.round(interaction.createdTimestamp / 1000)}:T>`)
                    )
            ],
        });

        const typeSelector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === interaction.user.id
        });

        typeSelector.on('collect', async (interaction) => {
            interaction.deferUpdate();

            postTypes = interaction.values;
        });

        const channelSelector = response.createMessageComponentCollector({
            componentType: ComponentType.ChannelSelect,
            filter: (i) => i.user.id === interaction.user.id
        });

        channelSelector.on('collect', async (interaction) => {
            interaction.deferUpdate();

            channel = await this.client.channels.fetch(interaction.values[0]);
        });

        const continueButton = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => i.user.id === interaction.user.id
        });

        continueButton.on('collect', async (i) => {
            await interaction.followUp({
                flags: ["IsComponentsV2"],
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`### Connect an Account`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`Successfully Connected account **${account}**`),
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`### Message:\n${message}`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`-# Command run by <@${interaction.user.id}> at <t:${Math.round(interaction.createdTimestamp / 1000)}:T>`)
                    )
                    .setAccentColor(0x00FF00)
                ],
            });
        });
    }
}
