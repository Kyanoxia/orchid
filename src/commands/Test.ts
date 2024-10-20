import { ApplicationCommandOptionBase, ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";

export default class Test extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "test",
            description: "Test Command",
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            global_permission: true,
            cooldown: 3,
            options: [],
            dev: false
        });
    }

    Execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({ content: "Fuck :speaking_head: :bangbang: :fire:", ephemeral: false });
    }
}
