import { ApplicationCommandOptionBase, ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";

export default class TestDev extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "testdev",
            description: "Test Dev-Only Command",
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.SendMessages,
            global_permission: false,
            cooldown: 3,
            options: [],
            dev: true
        });
    }

    Execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({ content: "Dev :speaking_head: :bangbang: :fire:", ephemeral: false });
    }
}
