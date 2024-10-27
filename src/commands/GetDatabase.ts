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
            dev: true
        });
    }

    Execute(interaction: ChatInputCommandInteraction) {
        SubscriberConfig.find({}).then((db) => {
            db.forEach((element) => {
                console.log(element);
            });
        });

        this.client.guilds.cache.forEach(guild => {
            const channels = guild?.channels ? JSON.parse(
                JSON.stringify(guild.channels)
            ).guild.channels : [];

            console.log(guild.id, channels);
        })

        interaction.reply({ content: "Please check your developer console...", ephemeral: true })
    }
}
