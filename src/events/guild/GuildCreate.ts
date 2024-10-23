import { EmbedBuilder, Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class GuildCreate extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.GuildCreate,
            description: "Guild Join Event",
            once: false
        })
    }

    async Execute(guild: Guild) {
        try {
            if (!await GuildConfig.exists({ guildID: guild.id }))
                await GuildConfig.create({ guildID: guild.id }) && console.log(`[LOG // STATUS] Bot joined a new server - adding to database: ${guild.id}`);
        } catch (err) {
            console.error(err);
        }

        const owner = await guild.fetchOwner();
        owner?.send({ embeds: [new EmbedBuilder()
            .setColor("#8AC3FF")
            .setDescription("✅ Bluecord has added your server to it's database!  Thank you for your patronage!\nIf you would like to delete this entry, please kick the bot from your server.")
        ]})
        .catch();
    }
}
