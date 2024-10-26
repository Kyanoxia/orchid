import { EmbedBuilder, Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";

export default class GuildCreat extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.GuildCreate,
            description: "Guild Join Event",
            once: false
        })
    }

    async Execute(guild: Guild) {
        console.log(`[LOG // STATUS] Bot joined a new server: ${guild.id}`);

        const owner = await guild.fetchOwner();
        owner?.send({ embeds: [new EmbedBuilder()
            .setColor("Green")
            .setDescription("✅ Bluecord has been successfully added to your server!")
        ]})
        .catch();
    }
}
