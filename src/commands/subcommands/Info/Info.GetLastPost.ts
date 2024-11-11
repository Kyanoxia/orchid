import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/SubCommand";

export default class InfoGetLastPost extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "info.getlastpost",
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setThumbnail(this.client.user?.displayAvatarURL()!)
                .setColor("#8AC3FF")
                .setDescription(`
                        Gets a user's last post.
                        __**Usage:**__
                        \`/getlastpost <username>\`
                        > **\`username\`** Handle or DID of the user you wish to disconnect
                        > **\`replies\`** Whether to include replies
                         `)
                .setFooter({ text: "For more information, please visit the bot's README (available through the embed link)", iconURL: this.client.user?.displayAvatarURL() })
                .setURL("https://github.com/Kyanoxia/skycord?tab=readme-ov-file#commands")
                .setTitle("/getlastpost")
        ] });
    }
}
