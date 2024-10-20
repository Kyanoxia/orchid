import { Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class GuildDelete extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.GuildDelete,
            description: "Guild Leave Event",
            once: false
        })
    }

    async Execute(guild: Guild) {
        try {
            await GuildConfig.deleteOne({ guildID: guild.id })
        } catch (err) {
            console.error(err);
        }
    }
}
