import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
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
                }
            ],
            dev: false
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        interaction.deferReply()
        const username = interaction.options.getString("username");

        try {
            const posts = await axios.get(`https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${username}&filter=posts_no_replies`);
            for (const element of posts.data.feed)
            {
                if (element.post.author.handle == username)
                {
                    const post = element.post;
                    const postHead = post.uri.split("post/").pop();

                    interaction.editReply({ content: `Most recent post from user: ${username}\nhttps://fxbsky.app/profile/${post.author.handle}/post/${postHead}` });

                    break;
                }
            }
        } catch (err) {
            console.error("[LOG // ERROR] Invalid response while getting post. Please check error logs.");
            console.error(err);
            interaction.editReply({ content: "Unable to fetch data.  Please check console." })
        }
    }
}
