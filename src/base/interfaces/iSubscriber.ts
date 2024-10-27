export default interface ISubscriber {
    guild: string;
    channel: string;
    username: string;
    message?: string;
    indexedAt: number;
    embedProvider: string;
    replies: boolean;

    toJSON(): object[];
}
