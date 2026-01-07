import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "src/base/classes/Command";
import CustomClient from "src/base/classes/CustomClient";
import Category from "src/base/enums/Category";
import Contexts from "src/base/enums/Contexts";

export default class Account extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "account",
            description: "Mock flow for connecting accounts",
            type: ApplicationCommandType.ChatInput,
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            contexts: [Contexts.Guild, Contexts.BotDM, Contexts.PrivateChannel],
            nsfw: false,
            cooldown: 3,
            options: [
                {
                    name: "connect",
                    description: "Connect an account using a handle or DID",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "account",
                            description: "DID or Handle for the ATProto Account",
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: "replies",
                            description: "Whether to announce replies",
                            type: ApplicationCommandOptionType.Boolean,
                            required: true
                        },
                        {
                            name: "message",
                            description: "Message to relay prior to the post",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        }
                    ]
                },
                {
                    name: "delete",
                    description: "Disconnect an account using a handle or DID",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "account",
                            description: "DID or Handle for the ATProto Account",
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
            ]
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
    }
}
