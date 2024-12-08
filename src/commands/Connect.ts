import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import Subscriber from "../base/classes/Subscriber";
import SubscriberConfig from "../base/schemas/SubscriberConfig";
import axios from "axios";
import SubscriberConfigv2 from "../base/schemas/SubscriberConfigv2";

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

        const channel = interaction.channelId;

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
            console.log(username);
        } catch (err) {
            console.error(err);
        }

        interface IDictionary {
            [index: string]: Object;
        }

        const data = {} as IDictionary;

        data[channel] = {
            message: message,
            replies: replies,
            embed: provider,
            regex: regex
        }

        try {
            console.log("Subscribing to " + username + " in " + channel);
            // Create user if not already
            if (!await SubscriberConfigv2.exists({ did: username }))
            {
                console.log("User not registered yet. Creating entry now...");
                await SubscriberConfigv2.create({ did: username, props: data });
                console.info("Created entry");
            }
            else
            {
                // Pull all the channels
                const pulledData = await SubscriberConfigv2.findOne({ did: username });
                var channels = pulledData?.props as unknown as IDictionary;

                // Update ours to new data
                channels[channel] = data[channel];

                // Push to db
                await SubscriberConfigv2.updateOne({ did: username }, { props: channels });
            }

            await interaction.editReply({ embeds: [new EmbedBuilder()
                .setColor("Green")
                .setDescription(`✅ Subscribed to user ${interaction.options.getString("username")} in channel <#${interaction.channelId}>`)
                .setFooter({ text: "If you're not already, consider self-hosting Skycord (Instructions on GitHub)", iconURL: this.client.user?.displayAvatarURL() })
            ]
            });
        } catch (err) {
            console.error(err);
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`❌ Uh oh! It looks like we didn't receive a response for that request.  Please make sure you spelled the user's handle correctly and try again!`)
                ]
            });
        }
    }
}
