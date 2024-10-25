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
                }
            ],
            dev: false
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const sub = new Subscriber(interaction.guildId!, interaction.channelId, interaction.options.getString("username")!, "Hello World");

        if (!await SubscriberConfig.exists({ guildID: sub.guild }))
        {
            console.log(`[LOG // STATUS] Subscribing to ${interaction.options.getString("username")} in guild: ${interaction.guildId}...`);
            await SubscriberConfig.create({ guildID: sub.guild, props: JSON.stringify(sub.toJSON())})
        }

        // Get document by field value and use data (WHY THE FUCK DID THEY ABANDON CALLBACKS WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA)
        SubscriberConfig.find({}).then((db) => {
            // Loop through the db
            db.forEach((element) => {
                console.log(element);
            });
            //console.log(JSON.parse(data[0].props));
        });

        interaction.reply({ embeds: [new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ Subscribed to user ${interaction.options.getString("username")} in channel <#${interaction.channelId}>`)
        ]
        });
    }
}
