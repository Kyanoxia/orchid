import { ApplicationCommandType, Collection, Events, REST, Routes } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "src/base/classes/Command";
import { DID } from "src/base/types/TDID";

export default class Ready extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.ClientReady,
            description: "Ready Event",
            once: true
        })
    }

    async Execute() {
        console.log(`${this.client.user?.displayName} is now ready!`);
        const rest = new REST().setToken(process.env.TOKEN);

        const setCommands: any = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
            body: this.GetJson(this.client.commands)
        });

        console.log(`Successfully set ${setCommands.length} commands!`);
    }

    private GetJson(commands: Collection<string, Command>): object[] {
        const data: object[] = [];

        commands.forEach(command => {
            data.push({
                name: command.name,
                description: command.type === ApplicationCommandType.ChatInput ? command.description : null,
                type: command.type,
                options: command.options,
                default_member_permissions: command.default_member_permissions.toString(),
                contexts: command.contexts,
                nsfw: command.nsfw,
            })
        })

        return data;
    }
}
