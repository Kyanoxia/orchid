import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/SubCommand";

export default class InfoList extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "info.list",
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setThumbnail(this.client.user?.displayAvatarURL()!)
                .setColor("#8AC3FF")
                .setDescription(`
                        List every account connected in the channel.
                        __**Usage:**__
                        \`/list\`
                         `)
                .setFooter({ text: "For more information, please visit the bot's README (available through the embed link)", iconURL: this.client.user?.displayAvatarURL() })
                .setURL("https://github.com/Kyanoxia/orchid?tab=readme-ov-file#commands")
                .setTitle("/list")
        ] });
    }
}
