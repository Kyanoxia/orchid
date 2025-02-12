import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/SubCommand";

export default class InfoDisconnect extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "info.disconnect",
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setThumbnail(this.client.user?.displayAvatarURL()!)
                .setColor("#8AC3FF")
                .setDescription(`
                        Disconnects an account from the channel.
                        __**Usage:**__
                        \`/disconnect <username>\`
                        > **\`username\`** Handle or DID of the user you wish to disconnect
                         `)
                .setFooter({ text: "For more information, please visit the bot's README (available through the embed link)", iconURL: this.client.user?.displayAvatarURL() })
                .setURL("https://github.com/Kyanoxia/orchid?tab=readme-ov-file#commands")
                .setTitle("/disconnect")
        ] });
    }
}
