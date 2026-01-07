import { ChatInputCommandInteraction, Collection, EmbedBuilder, Events, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import Command from "src/base/classes/Command";
import CustomClient from "src/base/classes/CustomClient";
import Event from "src/base/classes/Event";
import SubCommand from "src/base/classes/SubCommand";

export default class CommandHandler extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.InteractionCreate,
            description: "Command Handler Event",
            once: false
        })
    }

    Execute(interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) {
        if (!interaction.isChatInputCommand() && !interaction.isUserContextMenuCommand() && !interaction.isMessageContextMenuCommand()) return;

        const command: Command = this.client.commands.get(interaction.commandName)!;

        if (!command) {
            interaction.reply({ content: "This command does not exist!", ephemeral: true });
            console.error(`Command ${interaction.commandName} does not exist in ${interaction.guildId} / ${interaction.channelId}`);
            this.client.commands.delete(interaction.commandName);
        }

        const { cooldowns } = this.client;
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name)!;

        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(interaction.user.id) && (now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount)) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`❌ Please Wait another ${((((timestamps.get(interaction.user.id) || 0) + cooldownAmount) - now) / 1000).toFixed(1)} seconds to run this command again!`)
            ], ephemeral: true })
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            let subCommandGroup: string | null = null;
            let subCommand: string = interaction.commandName;

            if (interaction.isChatInputCommand()) {
                subCommandGroup = interaction.options.getSubcommandGroup(false);
                subCommand = `${interaction.commandName}${subCommandGroup ? `.${subCommandGroup}` : ""}.${interaction.options.getSubcommand(false) || ""}`;

                let fullName = interaction.options.getSubcommand(false) ? command.name + "." + interaction.options.getSubcommand(false) : command.name;
                console.log(`Executing command ${fullName}, called by ${interaction.user.username} (${interaction.user.id}) in ${interaction.guildId} / ${interaction.channelId}`)

                return this.client.subCommands.get(subCommand)?.Execute(interaction) || command.Execute(interaction);
            }
            
            return command.Execute(interaction);
        } catch (err) {
            console.error(err);
        }
    }
}
