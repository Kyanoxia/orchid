import { Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";

export default class GuildDelete extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.GuildDelete,
            description: "Guild Leave Event",
            once: false
        })
    }

    async Execute(guild: Guild) {
        console.log(`Bot left a server: ${guild.id}`);
    }
}
