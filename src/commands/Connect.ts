import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import Subscriber from "../base/classes/Subscriber";
import SubscriberConfig from "../base/schemas/SubscriberConfig";
import axios from "axios";

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
                    name: "provider",
                    description: "The embed provider you wish to use (Recommended: VixBluesky)",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: "BlueSky (bsky.app)", value: "bsky.app" },
                        { name: "FX Bsky (fxbsky.app)", value: "fxbsky.app" },
                        { name: "VixBluesky (bskyx.app)", value: "bskyx.app" }
                    ]
                },
                {
                    name: "replies",
                    description: "Whether to announce replies or not",
                    required: true,
                    type: ApplicationCommandOptionType.Boolean,
                    choices: [
                        { name: "True", content: true },
                        { name: "False", content: false }
                    ]
                },
                {
                    name: "message",
                    description: "The message to preface announcements with",
                    required: false,
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
        const provider = interaction.options.getString("provider");
        const replies = interaction.options.getBoolean("replies");
        var message = interaction.options.getString("message");

        if (!message)
        {
            message = "";
        }

        const filterReplies: string = replies ? "" : "&filter=posts_no_replies";

        // Get latest post
        try {
            const posts = await axios.get(`https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${username}${filterReplies}`);

            var indexedAt;

            for (const element of posts.data.feed)
            {
                if (element.post.author.handle == username)
                {
                    const post = element.post;

                    indexedAt = post.indexedAt.replace(/[^0-9]/g, '');

                    break;
                }
                else
                {
                    indexedAt = 0;
                }
            }
            
            const sub = new Subscriber(interaction.guildId!, interaction.channelId, username!, message!, indexedAt, provider!, replies!);

            // If our guild isn't registered, register it
            if (!await SubscriberConfig.exists({ guildID: sub.guild }))
            {
                console.log(`[LOG // STATUS] Subscribing to ${sub.username} in guild: ${sub.guild}...`);
                await SubscriberConfig.create({ guildID: sub.guild, props: JSON.stringify(sub.toJSON())}).then(() => { console.log(`[LOG // SUCCESS] Subscribed to ${sub.username} in ${sub.guild} / ${sub.channel} with replies: ${replies} and embed provider: ${provider}`)})
            }
            else
            {
                const db = await SubscriberConfig.find({ guildID: sub.guild });
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

                                // Update the sub (we're pushing anyways)
                                mongo[channel][user] = {
                                    message: sub.message,
                                    indexedAt: mongo[channel][user].indexedAt,
                                    embedProvider: sub.embedProvider,
                                    replies: sub.replies
                                }

                                // Stop checking (duh)
                                break;
                            }
                        }

                        if (!subPresent)
                        {
                            // Add it to the channel
                            mongo[channel] = {
                                ...mongo[channel],
                                [sub.username]:
                                {
                                    message: sub.message,
                                    indexedAt: sub.indexedAt,
                                    embedProvider: sub.embedProvider,
                                    replies: sub.replies
                                }
                            }
                        }

                        // Don't check any more
                        break;
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
                                message: sub.message,
                                indexedAt: sub.indexedAt,
                                embedProvider: sub.embedProvider,
                                replies: sub.replies
                            }
                        }
                    }
                }

                // Update the database
                SubscriberConfig.updateOne({ guildID: sub.guild }, { $set: { 'props': JSON.stringify(mongo) }, $currentDate: { lastModified: true } }).catch();
            }

            await interaction.editReply({ embeds: [new EmbedBuilder()
                .setColor("Green")
                .setDescription(`✅ Subscribed to user ${interaction.options.getString("username")} in channel <#${interaction.channelId}>`)
                .setFooter({ text: "If you're not already, consider self-hosting Skycord (Instructions on GitHub)", iconURL: this.client.user?.displayAvatarURL() })
            ]
            });
        } catch (err) {
            await interaction.editReply({embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`❌ Uh oh! It looks like we didn't receive a response for that request.  Please make sure you spelled the user's handle correctly!`)
            ]})
        }
    }
}
