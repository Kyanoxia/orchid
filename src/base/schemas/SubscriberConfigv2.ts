import { model, Schema } from "mongoose";

interface ISubscriberConfigv2 {
    did: string;
    props: string;
}

export default model<ISubscriberConfigv2>("SubscriberConfigv2", new Schema<ISubscriberConfigv2>({
    did: String,
    props: Object,
}, {
    timestamps: true
}))
