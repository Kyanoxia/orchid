import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import SubscriberConfig from "../base/schemas/SubscriberConfig";

export default class GetDatabase extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "getdatabase",
            description: "Gets every subscriber database entry",
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            global_permission: true,
            cooldown: 3,
            options: [],
            dev: true,
            ephemeral: true
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        try {
            const db = await SubscriberConfig.find({})
            for (const element in db)
            {
                console.log(element);
            }

            this.client.guilds.cache.forEach(guild => {
                const channels = guild?.channels ? JSON.parse(
                    JSON.stringify(guild.channels)
                ).guild.channels : [];
    
                console.log(guild.id, channels);
            })
        } catch (err) {
            console.error(`[LOG // ERROR] ${err}`);
        }

        await interaction.editReply({ content: "Please check your developer console..." })
    }
}
