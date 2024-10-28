import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Events, Guild, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";

export default class Emit extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "emit",
            description: "Emit an event",
            dev: true,
            default_member_permissions: PermissionsBitField.Flags.Administrator,
            global_permission: false,
            category: Category.Developer,
            cooldown: 1,
            options: [
                {
                    name: "event",
                    description: "Event to emit",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: "GuildCreate", value: Events.GuildCreate },
                        { name: "GuildDelete", value: Events.GuildDelete }
                    ]
                }
            ]
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const event = interaction.options.getString("event");

        if (event == Events.GuildCreate || event == Events.GuildDelete) {
            this.client.emit(event, interaction.guild as Guild);
        }

        await interaction.editReply({ embeds: [new EmbedBuilder()
            .setColor("Green")
            .setDescription(`Emitted Event: \`${event}\``)
        ]})
    }
}
