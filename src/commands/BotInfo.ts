import { ApplicationCommandOptionBase, ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
const { version, dependencies } = require(`${process.cwd()}/package.json`);
import ms from "ms";

export default class BotInfo extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "botinfo",
            description: "Display Bot Information",
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
                        <:bsky:1299097267751485460> __**BOT INFO**__
                        > **User:** \`${this.client.user?.tag}\` - \`${this.client.user?.id}\`
                        > **Guilds:** \`${this.client.guilds.cache.size}\`
                        > **Account Created:** <t:${(this.client.user!.createdTimestamp / 1000).toFixed(0)}:R>
                        > **Commands Registered:** \`${this.client.commands.size}\`
                        > **Version:** \`${version}\`
                        > **NodeJS Version:** \`${process.version}\`
                        > **Dependencies Registered:** \`${Object.keys(dependencies).length}\`
                        > **Dependencies:** \`${Object.keys(dependencies).map((p) => (`${p}-V${dependencies[p]}`).replace(/\^/g, "")).join(", ")}\`
                        > **Uptime:** \`${ms(this.client.uptime!, { long: false })}\``)
        ] });
    }
}
