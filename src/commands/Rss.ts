import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
const RssParser = require('rss-parser');
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";

export default class Rss extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "rss",
            description: "Fetch RSS Feed",
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.ManageWebhooks,
            global_permission: false,
            cooldown: 3,
            options: [
                {
                    name: "url",
                    description: "URL to fetch",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: []
                }
            ],
            dev: false
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const url = interaction.options.getString("url");

        const parser = new RssParser();

        try {
            const elem = await parser.parseURL(`${url}`).catch((err: any) => {console.error(err)});
            console.log(elem.items);
            elem.items.forEach((element: any) => {
                console.log(element.title);
            });
        } catch (err) {
            console.log(`[LOG // ERROR] Can not get user's RSS (Is unloggeed users enabled?)`);
        }
    }
}
