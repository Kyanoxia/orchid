import { IdResolver } from "@atproto/identity";
import { ChatInputCommandInteraction, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import CustomClient from "src/base/classes/CustomClient";
import SubCommand from "src/base/classes/SubCommand";
import { DID } from "src/base/types/TDID";
import { Account } from "src/databases/orchid/entities/account.entity";
import { Announcement } from "src/databases/orchid/entities/announcement.entity";

export default class AccountConnect extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "account.connect",
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const account = interaction.options.getString("account");
        const message = interaction.options.getString("message");
        const replies = interaction.options.getBoolean("replies");

        if (account === null) return;
        if (replies === null) return;

        const id = await resolveIdentity(account);

        if (!id) return await this.Panic(interaction);

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
        console.info("Finding DB Entry");
        const acc = await fork.findOne(Account, { did: DID(id.did) }, { populate: ['announcements'] });

        console.info("No Account Found in DB");
        if (!acc) {
            await interaction.editReply({
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
                            new TextDisplayBuilder().setContent(`\`${id.handle}\` is not in the database... _yet..._`),
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`-# Command run by <@${interaction.user.id}> at <t:${Math.round(interaction.createdTimestamp / 1000)}:T>`)
                        )

                ]
            });

            console.info("Making Announcement in DB");
            const announcement = new Announcement({
                channel: Buffer.from(interaction.channelId),
                message: message,
                replies: replies,
                account: new Account({
                    did: DID(id.did),
                    handle: id.handle
                })
            });

            console.info("Persisting");
            await fork.persistAndFlush(announcement);

            return await interaction.editReply({
                flags: "IsComponentsV2",
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`### ✅ Okay!`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`\`${id.handle}\` did!`),
                            new TextDisplayBuilder().setContent(`- \`replies\` ${replies}\n- \`message\` ${message}`)
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

interface AtprotoIdentity {
    did: string;
    handle: string;
}

function getHandleFromAka(alsoKnownAs: string[] | undefined): string | null {
    if (!alsoKnownAs || alsoKnownAs.length === 0) {
        throw new Error("Invalid DID Document. Field 'alsoKnownAs' is malformed or nonexistent.");
    }

    // The spec says the first valid 'at://' URI is the primary handle
    const handleUri = alsoKnownAs.find(uri => uri.startsWith('at://'));

    if (handleUri) {
        // Remove the 'at://' prefix to get just the handle
        const handle = handleUri.substring('at://'.length);
        // Basic validation to ensure it looks like a domain name (contains a dot)
        if (handle.includes('.')) {
            return handle;
        }
    }

    throw new Error("Invalid DID document. Field 'alsoKnownAs' is malformed or nonexistend.");
}

async function resolveIdentity(identifier: string): Promise<AtprotoIdentity | null> {
    const resolver = new IdResolver();

    if (identifier.startsWith('did:')) {
        const didDoc = await resolver.did.resolve(identifier);
        if (didDoc == null) return null;

        return {
            did: identifier,
            handle: getHandleFromAka(didDoc.alsoKnownAs)!
        }
    }
    else {
        const did = await resolver.handle.resolve(identifier);
        if (!did) return null;

        return {
            did: did,
            handle: identifier
        }
    }
}
