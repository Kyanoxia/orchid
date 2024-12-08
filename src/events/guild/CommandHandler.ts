import { ChatInputCommandInteraction, Collection, EmbedBuilder, Events } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { configDotenv } from "dotenv";

export default class CommandHandler extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.InteractionCreate,
            description: "Command handler event",
            once: false
        })
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        configDotenv();

        if (!interaction.isChatInputCommand()) return;

        const command: Command = this.client.commands.get(interaction.commandName)!;

        console.log("Received command: " + interaction.commandName);

        await interaction.deferReply({ephemeral: command.ephemeral});

        //@ts-expect-error
        if (!command) return interaction.editReply({ content: "This command does not exist!" }) && this.client.commands.delete(interaction.commandName);

        if (command.dev && !process.env.devUID.includes(interaction.user.id))
            return interaction.editReply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`❌ This command is only available to developers.`)
            ]})

        const { cooldowns } = this.client;
        if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());

        const now = Date.now();
        const timestamps = cooldowns.get(command.name)!;
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(interaction.user.id) && (now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount))
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`❌ Please wait another \`${((((timestamps.get(interaction.user.id) || 0) + cooldownAmount) - now) / 1000).toFixed(1)}\` seconds to run this command.`)
                ]
            });
        
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            const subCommandGroup = interaction.options.getSubcommandGroup(false);
            const subCommand = `${interaction.commandName}${subCommandGroup ? `.${subCommandGroup}` : ""}.${interaction.options.getSubcommand(false) || ""}`;

            return this.client.subCommands.get(subCommand)?.Execute(interaction) || command.Execute(interaction);
        } catch (err) {
            console.error(err);
        }
    }
}
