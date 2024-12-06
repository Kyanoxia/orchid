import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import axios from "axios";

export default class GetLastPost extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "getlastpost",
            description: "Fetch user's last post from api.bsky.com",
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.ManageWebhooks,
            global_permission: true,
            cooldown: 3,
            options: [
                {
                    name: "username",
                    description: "Username to fetch",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: []
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
                }
            ],
            dev: false,
            ephemeral: false
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const username = interaction.options.getString("username");
        var replies = interaction.options.getBoolean("replies");

        replies = replies != null ? replies : false;

        const filterReplies: string = replies ? "" : "&filter=posts_no_replies";

        try {
            const posts = await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error(`Timed out request for ${username}`))
                }, 2000)
              
                axios.get(`https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${username}${filterReplies}`).then(value => {
                    clearTimeout(timeoutId);
                    resolve(value);
                });
            });

            //@ts-expect-error
            for (const element of posts.data.feed)
            {
                if (element.post.author.handle == username)
                {
                    const post = element.post;
                    const postHead = post.uri.split("post/").pop();

                    await interaction.editReply({ content: `Most recent post from user: ${username}\nhttps://bsky.app/profile/${post.author.handle}/post/${postHead}` });

                    break;
                }
            }
        } catch (err) {
            console.error(err);
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription("❌ Unable to fetch data.  Please make sure everything is spelled correctly.")
                ]
            })
        }
    }
}
