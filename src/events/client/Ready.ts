import { ActivityType, Collection, Events, Integration, REST, Routes } from "discord.js";
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

        console.log(`[LOG // SUCCESS] ${this.client.user?.tag} is now ready!`);

        const clientID = this.client.developmentMode ? process.env.devDiscordClientID : process.env.discordClientID;
        const rest = new REST().setToken(process.env.token);

        if (!this.client.developmentMode) {
            const globalCommands: any = await rest.put(Routes.applicationCommands(clientID), {
                body: this.GetJson(this.client.commands.filter(command => !command.dev))
            });

            console.log(`[LOG // SUCCESS] Successfully set ${globalCommands.length} Global Application (/) Commands`)
        }

        const devCommands: any = await rest.put(Routes.applicationGuildCommands(clientID, process.env.devGuildID), {
            body: this.GetJson(this.client.commands.filter(command => command.dev))
        });

        console.log(`[LOG // SUCCESS] Successfully set ${devCommands.length} Developer Application (/) Commands`)

        this.client.user?.setPresence({
            activities: [{
                name: 'with my cock',
                type: ActivityType.Playing,
            }]
        })
    }

    private GetJson(commands: Collection<string, Command>): object[] {
        const data: object[] = [];

        commands.forEach(command => {
            data.push({
                name: command.name,
                description: command.description,
                options: command.options,
                default_member_permissions: command.default_member_permissions.toString(),
                dm_permission: command.global_permission,
                integration_types: command.global_permission ? [0, 1] : [0],
                contexts: command.global_permission ? [0, 1, 2] : [0]
            })
        });

        return data;
    }
}
