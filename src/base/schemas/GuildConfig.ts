import { model, Schema } from "mongoose";

interface IGuildConfig {
    guildID: string;
}

export default model<IGuildConfig>("GuildConfig", new Schema<IGuildConfig>({
    guildID: String,
}, {
    timestamps: true
}))
