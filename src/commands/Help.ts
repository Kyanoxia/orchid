import { ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";

export default class Help extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "help",
            description: "Display command information",
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            global_permission: true,
            cooldown: 3,
            options: [],
            dev: false
        });
    }

    Execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setThumbnail(this.client.user?.displayAvatarURL()!)
                .setColor("#8AC3FF")
                .setDescription(`
                        > **\`/help\`** Display the help dialogue
                        > **\`/connect\`** Connect a user account
                        > **\`/disconnect\`** Disconnect a user account
                        > **\`/list\` List all connected accounts in a given channel
                        > **\`/getlastpost\`** Get last post of a user account (excluding reposts and replies)
                        > **\`/botinfo\`** Display information about Skycord`)
                .setFooter({ text: "For more information, please visit the bot's README (available through the embed link)", iconURL: this.client.user?.displayAvatarURL() })
                .setURL("https://github.com/Kyanoxia/skycord?tab=readme-ov-file#commands")
                .setTitle("Bot Help")
        ] });
    }
}
