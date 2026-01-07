import { IdResolver } from "@atproto/identity";
import { ChatInputCommandInteraction, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import CustomClient from "src/base/classes/CustomClient";
import SubCommand from "src/base/classes/SubCommand";
import { DID } from "src/base/types/TDID";
import { Account } from "src/databases/orchid/entities/account.entity";
import { Announcement } from "src/databases/orchid/entities/announcement.entity";

export default class AccountDelete extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "account.delete",
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const account = interaction.options.getString("account");

        if (account === null) return;

        const db = this.client.databases.get("Orchid V2");
        if (!db) {
            return await interaction.editReply({
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
        }

        const fork = db.em.fork();
        const acc = account.startsWith("did:")
            ? await fork.findOne(Account, { did: DID(account) }, { populate: ['announcements'] })
            : await fork.findOne(Account, { handle: account }, { populate: ['announcements'] });

        if (!acc) {
            return await interaction.editReply({
                flags: "IsComponentsV2",
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`### ⚠️ Warning!`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`\`${account}\` is not in the database... Cannot delete!`),
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

        fork.remove(acc).flush();

        await interaction.editReply({
            flags: "IsComponentsV2",
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`### ℹ️ Info!`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`\`${account}\` is in the database!`),
                        new TextDisplayBuilder().setContent(`\`\`\`json\n${JSON.stringify(acc, null, 2)}\n\`\`\``)
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
