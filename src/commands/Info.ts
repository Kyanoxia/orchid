import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";

export default class Info extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "info",
            description: "Display command information",
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            global_permission: false,
            cooldown: 3,
            options: [
                {
                    name: "botinfo",
                    description: "List info for /botinfo",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "connect",
                    description: "List info for /connect",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "disconnect",
                    description: "List info for /disconnect",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "help",
                    description: "List info for /help",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "info",
                    description: "List info for /info",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "list",
                    description: "List info for /list",
                    type: ApplicationCommandOptionType.Subcommand
                },
            ],
            dev: false,
            ephemeral: false
        });
    }
}
