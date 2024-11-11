import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/SubCommand";

export default class InfoHelp extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "info.help",
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setThumbnail(this.client.user?.displayAvatarURL()!)
                .setColor("#8AC3FF")
                .setDescription(`
                        Display bot help page.
                        __**Usage:**__
                        \`/help\`
                         `)
                .setFooter({ text: "For more information, please visit the bot's README (available through the embed link)", iconURL: this.client.user?.displayAvatarURL() })
                .setURL("https://github.com/Kyanoxia/skycord?tab=readme-ov-file#commands")
                .setTitle("/help")
        ] });
    }
}
