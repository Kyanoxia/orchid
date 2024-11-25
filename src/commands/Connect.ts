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
                    name: "message",
                    description: "The message to preface announcements with",
                    required: false,
                    type: ApplicationCommandOptionType.String,
                    choices: []
                },
                {
                    name: "provider",
                    description: "The embed provider you wish to use (Recommended: Bskye)",
                    required: false,
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: "BlueSky (bsky.app)", value: "bsky.app" },
                        { name: "FX Bsky (fxbsky.app)", value: "fxbsky.app" },
                        { name: "VixBluesky (bskyx.app)", value: "bskyx.app" },
                        { name: "Bskye (bskye.app)", value: "bskye.app" }
                    ]
                },
                {
                    name: "replies",
                    description: "Whether to announce replies or not",
                    required: false,
                    type: ApplicationCommandOptionType.Boolean,
                    choices: [
                        { name: "True", content: true },
                        { name: "False", content: false }
                    ]
                },
                {
                    name: "regex",
                    description: "Regex blacklist to check on the body of your posts",
                    required: false,
                    type: ApplicationCommandOptionType.String,
                    choices: []
                }
            ],
            dev: false,
            ephemeral: false
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        // Get every possible option
        var username = interaction.options.getString("username");
        var provider = interaction.options.getString("provider");
        var message = interaction.options.getString("message");
        var replies = interaction.options.getBoolean("replies");
        var regex = interaction.options.getString("regex");

        // Default options because I don't want to store null in the db
        message = message != null ? message : "";
        provider = provider != null ? provider : "bskye.app";
        replies = replies != null ? replies : false;

        const filterReplies: string = replies ? "" : "&filter=posts_no_replies";

        // String to regex
        function toRegExp(string: string): RegExp {
            try {
                const match = string.match(/^\/((?:\\.|[^\\])*)\/(.*)$/);
                const exp = match![1];
                const arg = match![2];

                return new RegExp(exp, arg);
            } catch (err) {
                throw "Error while creating RegExp: " + err;
            }
        }

        // We're using regex
        if (regex != null)
        {
            // If it's valid continue, otherwise stop the loop with an error
            try {
                console.info("Testing Valid Regex for user: ", username)
                toRegExp(regex);
            } catch (err) {
                console.error(err);
                await interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`❌ Uh oh! You provided an invalid RegEx!  Please make sure your syntax and arguments are proper and try again!`)
                    ]
                });

                return;
            }
        }
        else
        {
            regex = "";
        }

        // Get user's DID
        try {
            const didReq = await axios.get(`https://api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${username}`);
            username = didReq.data.did;
        } catch (err) {
            console.error(err);
        }

        // Get latest post
        try {
            const posts = await axios.get(`https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${username}${filterReplies}`);

            var indexedAt;

            for (const element of posts.data.feed)
            {
                if (element.post.author.did == username)
                {
                    const post = element.post;

                    // I don't know why I don't just use the premade functions to do this - it would be much easier and I could treat them as timecodes.
                    indexedAt = post.indexedAt.replace(/[^0-9]/g, '');

                    console.info(post.indexedAt.replace(/[^0-9]/g, ''))

                    break;
                }
                else
                {
                    indexedAt = 0;
                }
            }

            console.info(indexedAt);
            
            // Register subscriber for ease
            const sub = new Subscriber(interaction.guildId!, interaction.channelId, username!, message!, indexedAt, provider!, replies!, regex!);

            // If our guild isn't registered, register it
            if (!await SubscriberConfig.exists({ guildID: sub.guild }))
            {
                console.info(`Subscribing to ${sub.username} in guild: ${sub.guild}...`);
                await SubscriberConfig.create({ guildID: sub.guild, props: JSON.stringify(sub.toJSON())}).then(() => { console.log(`Subscribed to ${sub.username} in ${sub.guild} / ${sub.channel} with replies: ${replies} and embed provider: ${provider}`)})
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
                                    replies: sub.replies,
                                    regex: sub.regex
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
                                    replies: sub.replies,
                                    regex: sub.regex
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
                                replies: sub.replies,
                                regex: sub.regex
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
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`❌ Uh oh! It looks like we didn't receive a response for that request.  Please make sure you spelled the user's handle correctly and try again!`)
                ]
            });
        }
    }
}
