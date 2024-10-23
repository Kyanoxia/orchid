import { model, Schema } from "mongoose";

interface ISubscriberConfig {
    guildID: string;
    channelID: string;
    accounts: JSON;
}

export default model<ISubscriberConfig>("SubscriberConfig", new Schema<ISubscriberConfig>({
    guildID: String,
    channelID: String,
    accounts: JSON,
}, {
    timestamps: true
}))
