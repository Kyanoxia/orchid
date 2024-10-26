import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import Subscriber from "../base/classes/Subscriber";
import SubscriberConfig from "../base/schemas/SubscriberConfig";

export default class Connect extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "connect",
            description: "Connect account by username (ex. \"kyanoxia.com\" or \"kyanoxia.bsky.social\"",
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
                },
                {
                    name: "message",
                    description: "The message to preface announcements with",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: []
                }
            ],
            dev: false
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const sub = new Subscriber(interaction.guildId!, interaction.channelId, interaction.options.getString("username")!, interaction.options.getString("message")!);

        // If our guild isn't registered, register it
        if (!await SubscriberConfig.exists({ guildID: sub.guild }))
        {
            console.log(`[LOG // STATUS] Subscribing to ${sub.username} in guild: ${sub.guild}...`);
            await SubscriberConfig.create({ guildID: sub.guild, props: JSON.stringify(sub.toJSON())}).then(() => { console.log(`[LOG // SUCCESS] Subscribed to ${sub.username} in ${sub.guild} / ${sub.channel}`)})
        }
        else
        {
            SubscriberConfig.find({ guildID: sub.guild }).then((db) => {
                var mongo = JSON.parse(db[0].props);

                var channelPresent: boolean = false;
                // Check if our channel is present
                for (var channel in mongo)
                {
                    // If we find ours
                    if (channel == sub.channel)
                    {
                        channelPresent = true;
                        
                        var subPresent: boolean = false;
                        // Check if our sub is present
                        for (var user in mongo[channel])
                        {
                            if (user == sub.username)
                            {
                                subPresent = true;
                                // If our message is not the same, CHANGE IT
                                if (mongo[channel][user].message != sub.message)
                                {
                                    mongo[channel][user].message = sub.message;
                                    console.log(mongo[channel][user].message);
                                }

                                // Stop checking (duh)
                                //break;
                            }
                        }

                        if (!subPresent)
                        {
                            // Add it to the channel
                            mongo[channel] = {
                                ...mongo[channel],
                                [sub.username]:
                                {
                                    message: sub.message
                                }
                            }
                        }

                        // Don't check any more
                        //break;
                    }
                }

                if (!channelPresent)
                {
                    // Register a subscriber to the channel
                    mongo = {
                        ...mongo,
                        [sub.channel]:
                        {
                            [sub.username]:
                            {
                                message: sub.message
                            }
                        }
                    }
                }

                console.log(mongo);

                // Update the database
                SubscriberConfig.updateOne({ guildID: sub.guild }, { $set: { 'props': JSON.stringify(mongo) }, $currentDate: { lastModified: true } }).catch();

                //feed.items.forEach(item => {
                //    console.log(item.title + ':' + item.link) // item will have a `bar` property type as a number
                //});
            });
        }

        interaction.reply({ embeds: [new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ Subscribed to user ${interaction.options.getString("username")} in channel <#${interaction.channelId}>`)
        ]
        });
    }
}
