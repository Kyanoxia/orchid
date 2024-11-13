import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/SubCommand";

export default class InfoConnect extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "info.connect",
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setThumbnail(this.client.user?.displayAvatarURL()!)
                .setColor("#8AC3FF")
                .setDescription(`
                        Connects an account to the channel.
                        __**Usage:**__
                        \`/connect <username> [message] [provider] [replies]\`
                        > **\`username\`** Handle or DID of the user you wish to connect
                        > **\`message\`** Message to preface links with
                        > **\`provider\`** What embed provider the bot will use
                        > **\`replies\`** Whether the bot will announce replies or not
                        > **\`regex\`** Regular Expression (RegEx) to filter your posts (blacklist mode)
                         `)
                .setFooter({ text: "For more information, please visit the bot's README (available through the embed link)", iconURL: this.client.user?.displayAvatarURL() })
                .setURL("https://github.com/Kyanoxia/skycord?tab=readme-ov-file#commands")
                .setTitle("/connect")
        ] });
    }
}
