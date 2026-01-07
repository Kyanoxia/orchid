import { ApplicationCommandType, ChatInputCommandInteraction, ContainerBuilder, PermissionsBitField, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import Command from "src/base/classes/Command";
import CustomClient from "src/base/classes/CustomClient";
import Category from "src/base/enums/Category";
import Contexts from "src/base/enums/Contexts";
import { DID } from 'src/base/types/TDID';
import { Account } from "src/databases/orchid/entities/account.entity";
import { Announcement } from "src/databases/orchid/entities/announcement.entity";

export default class Ping extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "ping",
            description: "Get the bot latency",
            type: ApplicationCommandType.ChatInput,
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            contexts: [Contexts.Guild, Contexts.BotDM, Contexts.PrivateChannel],
            nsfw: false,
            cooldown: 3,
            options: [],
        })
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const shardId = interaction.guild?.shardId;

        const db = this.client.databases.get("Orchid V2");
        if (!db) {
            interaction.reply({
                flags: "IsComponentsV2",
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`### 🚨 Error!`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`An error occurred when trying to get the database.  Please check your console for more information.`),
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`-# Command run by <@${interaction.user.id}> at <t:${Math.round(interaction.createdTimestamp / 1000)}:T>`)
                        )

                ]
            });

            return;
        }
        
        const fork = db.em.fork();
        // const announcement = new Announcement({
        //     channel: Buffer.from(interaction.channelId),
        //     message: "An announcement test",
        //     account: new Account({
        //         did: DID("did:plc:szroyyl5sbivkrdhlxhqlm2t"),
        //         handle: "lyssa.kyanoxia.com"
        //     })
        // });

        // await fork.persistAndFlush(announcement);

        const acc = await fork.findOneOrFail(Account, { handle: "lyssa.kyanoxia.com" }, { populate: ['announcements'] });

        console.log(acc);

        for (const announcement of acc.announcements) {
            console.log(announcement.channel.toString());
        }

        interaction.reply({
            flags: "IsComponentsV2",
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`### 🏓 Ping`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`Overall Latency: \`${Date.now() - interaction.createdTimestamp}ms\``),
                        new TextDisplayBuilder().setContent(`Shard Latency: \`${this.client.ws.shards.get(shardId!)?.ping ?? 0}ms\``),
                        new TextDisplayBuilder().setContent(`API Latency: \`${this.client.ws.ping}ms\``)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`-# Command run by <@${interaction.user.id}> at <t:${Math.round(interaction.createdTimestamp / 1000)}:T>`)
                    )

            ]
        });
    }
}
