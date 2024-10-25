import { ApplicationCommandOptionBase, ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
const { version, dependencies } = require(`${process.cwd()}/package.json`);
import ms from "ms";
import SubscriberConfig from "../base/schemas/SubscriberConfig";

export default class GetDatabase extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "getdatabase",
            description: "Gets EVERY SINGLE FUCKING ENTRY TO THE DATABASE (index at large no param)",
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
            // Loop through the db
            db.forEach((element) => {
                console.log(element);
            });
            //console.log(JSON.parse(data[0].props));
        });
    }
}
