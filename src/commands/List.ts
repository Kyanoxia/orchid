import { ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import SubscriberConfig from "../base/schemas/SubscriberConfig";
import axios from "axios";
import SubscriberConfigv2 from "../base/schemas/SubscriberConfigv2";

export default class GetDatabase extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "list",
            description: "Gets every subscriber in current channel",
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            global_permission: false,
            cooldown: 3,
            options: [],
            dev: false,
            ephemeral: true
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        var message: string = "";
        const channel = interaction.channelId;

        var users: string[] = [];

        interface IDictionary {
            [index: string]: Object;
        }

        // Pull all the channels
        const pulledData = await SubscriberConfigv2.find({});

        for (const i in pulledData)
        {
            var channels = pulledData[i].props as unknown as IDictionary;

            if (channels.hasOwnProperty(channel))
            {
                var username;
                const did = pulledData[i].did;
                try {
                    const didReq = await axios.get(`https://api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${did}`);
                    username = didReq.data.handle;
                } catch (err) {
                    console.error(err);
                }

                users.push(pulledData[i].did);
                //@ts-expect-error
                message += "- " + ("`" + pulledData[i].did + "`" + " (" + username + ")" + ":\n" + "Embeds by `" + channels[channel].embed + "` - Replies? `" + channels[channel].replies + "`\n" + "> `" + (channels[channel].regex == "" ? "No Regex" : channels[channel].regex) + "`\n");
            }
        }

        if (message == "")
        {
            message = "Not subscribed to anybody yet!";
        }

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setThumbnail(this.client.user?.displayAvatarURL()!)
                .setColor("#5AB8FE")
                .setDescription(`${message}`)
                .setFooter({ text: "For more information, please visit the bot's README (available through the embed link)", iconURL: this.client.user?.displayAvatarURL() })
                .setURL("https://github.com/Kyanoxia/skycord")
                .setTitle("Subscribed Accounts")
        ] });
    }
}
