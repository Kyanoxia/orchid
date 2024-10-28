import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import SubscriberConfig from "../base/schemas/SubscriberConfig";

export default class Disconnect extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "disconnect",
            description: "Disconnect account by username (ex. \"kyanoxia.com\" or \"kyanoxia.bsky.social\"",
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.ManageWebhooks,
            global_permission: false,
            cooldown: 3,
            options: [
                {
                    name: "username",
                    description: "The username to connect (including \".bsky.social\" if applicable)",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: []
                }
            ],
            dev: false
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const username = interaction.options.getString("username");

        console.log(`[LOG // STATUS] Unsubscribing to ${username} in ${interaction.guildId} / ${interaction.channelId}...`)

        if (!await SubscriberConfig.exists({ guildID: interaction.guildId }))
        {
            console.log(`[LOG // WARN] Cannot delete subscription in unregistered guild: ${interaction.guildId}`);
            await interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`❌ Can not delete subscription in unregistered guild!`)
            ]
            });
        }
        else
        {
            const db = await SubscriberConfig.find({ guildID: interaction.guildId });
            var mongo = JSON.parse(db[0].props);

            // Check if our subscription is present
            for (var channel in mongo)
            {
                for (var user in mongo[channel])
                {
                    // Delete the subscription if we have it
                    if (Object.keys(mongo[channel]).includes(`${username}`))
                    {
                        delete mongo[channel][user];
                    }
                    else
                    {
                        await interaction.editReply({ embeds: [new EmbedBuilder()
                            .setColor("Red")
                            .setDescription("❌ Can not unsubscribe from unregistered user!")
                        ]
                        });

                        return;
                    }
                }

                // Delete the whole channel if it's empty
                if (Object.keys(mongo[channel]).length == 0)
                {
                    delete mongo[channel];
                }
            }

            // Update the database (delete entry if empty)
            if (Object.keys(mongo).length == 0)
            {
                console.log(`[LOG // STATUS] No more subscriptions found in ${interaction.guildId}. Deleting document...`);
                try {
                    await SubscriberConfig.deleteMany({ guildID: interaction.guildId });
                } catch (err) {
                    console.log(err);
                }
            }
            else
            {
                console.log(`[LOG // STATUS] Updating information for ${interaction.guildId}`);
                try {
                    await SubscriberConfig.updateOne({ guildID: interaction.guildId }, { $set: { 'props': JSON.stringify(mongo) }, $currentDate: { lastModified: true } }).catch();
                } catch (err) {
                    console.log(err);
                }
            }

            await interaction.editReply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`❌ Unsubscribed to user ${username} in channel <#${interaction.channelId}>`)
            ]
            });

            console.log(`[LOG // SUCCESS] Unsubscribed from user ${username} in ${interaction.guildId} / ${interaction.channelId}`);
        }
    }
}
