import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import axios from "axios";
import SubscriberConfigv2 from "../base/schemas/SubscriberConfigv2";

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
        const channel = interaction.channelId;

        interface IDictionary {
            [index: string]: Object;
        }

        var uid
        var number: number = 0;

        async function GetAPIData() {
            if (number >= 3) return;
            try {
                console.log("Sending API request to get UID...");
    
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

        if (!await SubscriberConfigv2.exists({ did: uid }))
        {
            console.warn(`Cannot delete a subscription that doesn't exist!`);
            await interaction.editReply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`❌ Can't unsubscribe from an unregistered user!`)
            ]
            });
        }
        else
        {
            // Pull all the channels the user is in
            const pulledData = await SubscriberConfigv2.findOne({ did: uid });
            var channels = pulledData?.props as unknown as IDictionary;

            console.info("\n" + `Deleting ${uid} in channel ${channel}.` + "\n");

            // If it's not subbed to our channel
            if (!channels.hasOwnProperty(channel))
            {
                await interaction.editReply({ embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`❌ Can't unsubscribe from an unregistered user!`)
                ]
                });

                return;
            }

            console.info(channels);

            // Delete our channel
            delete channels[channel];

            console.info(channels);

            console.info("Pushing changes to database...");
            console.info(uid);
            await SubscriberConfigv2.updateOne({ did: uid }, { props: channels });

            if (Object.keys(channels).length == 0)
            {
                console.info(`User ${uid} no longer has channels subscribed to them. Deleting database entry...`);
                await SubscriberConfigv2.deleteOne({ did: uid });
            }

            await interaction.editReply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`❌ Unsubscribed to user ${username} (${uid}) in channel <#${interaction.channelId}>`)
            ]
            });

            console.info(`Unsubscribed from ${uid} in ${interaction.channelId}`);
        }
    }
}
