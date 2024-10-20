import { Collection, Events, Integration, REST, Routes } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { configDotenv } from "dotenv";

export default class Ready extends Event {
    constructor(client: CustomClient)
    {
        super(client, {
            name: Events.ClientReady,
            description: "Ready Event",
            once: true
        })
    }

    async Execute() {
        configDotenv();

        console.log(`${this.client.user?.tag} is now ready!`);

        const clientID = this.client.developmentMode ? process.env.devDiscordClientID : process.env.discordClientID;
        const rest = new REST().setToken(process.env.token);

        if (!this.client.developmentMode) {
            const globalCommands: any = await rest.put(Routes.applicationCommands(clientID), {
                body: this.GetJson(this.client.commands.filter(command => !command.dev))
            });

            console.log(`Successfully set ${globalCommands.length} Global Application (/) Commands`)
        }

        const devCommands: any = await rest.put(Routes.applicationGuildCommands(clientID, process.env.devGuildID), {
            body: this.GetJson(this.client.commands.filter(command => command.dev))
        });

        console.log(`Successfully set ${devCommands.length} Developer Application (/) Commands`)
    }

    private GetJson(commands: Collection<string, Command>): object[] {
        const data: object[] = [];

        commands.forEach(command => {
            data.push({
                name: command.name,
                description: command.description,
                options: command.options,
                default_member_permissions: command.default_member_permissions.toString(),
                dm_permission: command.dm_permission,
                integration_types: [0, 1],
                contexts: [0, 1, 2]
            })
        });

        return data;
    }
}