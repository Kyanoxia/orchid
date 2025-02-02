import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/SubCommand";

export default class InfoInfo extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "info.info",
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setThumbnail(this.client.user?.displayAvatarURL()!)
                .setColor("#8AC3FF")
                .setDescription(`
                        (subcommand) List information about a command.
                        __**Usage:**__
                        \`/info <command>\`
                        > **\`command\`** command to get info for
                        > - botinfo
                        > - connect
                        > - disconnect
                        > - getlastpost
                        > - help
                        > - info
                        > - list
                         `)
                .setFooter({ text: "For more information, please visit the bot's README (available through the embed link)", iconURL: this.client.user?.displayAvatarURL() })
                .setURL("https://github.com/Kyanoxia/orchid?tab=readme-ov-file#commands")
                .setTitle("/info")
        ] });
    }
}
