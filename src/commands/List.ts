import { ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import SubscriberConfig from "../base/schemas/SubscriberConfig";

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
            dev: false
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        var message: string = "";
        const db = await SubscriberConfig.find({ guildID: interaction.guildId });
        for (const element in db)
        {
            const props = JSON.parse(db[element].props);
            const channel = interaction.channelId;
            var sub: string = "- ";

            for (const user in props[channel])
            {
                message = message + sub + (user + ": " + "Embeds by `" + props[channel][user].embedProvider + "` - Replies? `" + props[channel][user].replies + "`\n");
            }
        }

        if (message == "")
        {
            message = "Not subscribed to anybody yet!";
        }

        await interaction.reply({
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
