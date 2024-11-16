import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import SubscriberConfig from "../base/schemas/SubscriberConfig";
import axios from "axios";

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
            dev: false,
            ephemeral: false
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const username = interaction.options.getString("username");

        var uid
        var number: number = 0;

        async function GetAPIData() {
            if (number >= 3) return;
            try {
                console.log("Sending API request for UID");
    
                uid = await new Promise<string>(async (resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error(`Timed out request for ${username}`))
                    }, 2000);
    
                    var value;
                    try {
                        value = await axios.get(`https://api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${username}`);
                        uid = value.data.did;
                    } catch (err) {
                        console.error(`Axios responded with: ${err}`);
                    }
    
                    clearTimeout(timeoutId);
                    resolve(value?.data.did);

                    console.log("Resolved API Request for UID: " + value?.data.did);
                });
    
            } catch (err) {
                console.error(err);
                console.warn("Trying again (" + number + ")...");
                number++;

                await interaction.editReply({ embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`❌ The BlueSky API is taking too long to respond!  Trying again... (${number})`)
                ]
                });

                GetAPIData();
            }
        }

        await GetAPIData();

        console.info(`Unsubscribing from ${username} (${uid}) in ${interaction.guildId} / ${interaction.channelId}...`)

        if (!await SubscriberConfig.exists({ guildID: interaction.guildId }))
        {
            console.warn(`Cannot delete subscription in unregistered guild: ${interaction.guildId}`);
            await interaction.editReply({ embeds: [new EmbedBuilder()
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
                // Delete the subscription if we have it
                if (Object.keys(mongo[channel]).includes(`${username}`))
                {
                    delete mongo[channel][username!];
                }
                else if (Object.keys(mongo[channel]).includes(`${uid}`))
                {
                    delete mongo[channel][uid!];
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

                // Delete the whole channel if it's empty
                if (Object.keys(mongo[channel]).length == 0)
                {
                    delete mongo[channel];
                }
            }

            // Update the database (delete entry if empty)
            if (Object.keys(mongo).length == 0)
            {
                console.log(`No more subscriptions found in ${interaction.guildId}. Deleting document...`);
                try {
                    await SubscriberConfig.deleteMany({ guildID: interaction.guildId });
                } catch (err) {
                    console.error(err);
                }
            }
            else
            {
                console.log(`Updating information for ${interaction.guildId}`);
                try {
                    await SubscriberConfig.updateOne({ guildID: interaction.guildId }, { $set: { 'props': JSON.stringify(mongo) }, $currentDate: { lastModified: true } }).catch();
                } catch (err) {
                    console.error(err);
                }
            }

            await interaction.editReply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`❌ Unsubscribed to user ${username} in channel <#${interaction.channelId}>`)
            ]
            });

            console.log(`Unsubscribed from user ${username} in ${interaction.guildId} / ${interaction.channelId}`);
        }
    }
}
