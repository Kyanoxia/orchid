import { model, Schema } from "mongoose";

interface ISubscriberConfig {
    guildID: string;
    props: string;
}

export default model<ISubscriberConfig>("SubscriberConfig", new Schema<ISubscriberConfig>({
    guildID: String,
    props: String,
}, {
    timestamps: true
}))
