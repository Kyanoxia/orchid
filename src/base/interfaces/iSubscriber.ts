export default interface ISubscriber {
    guild: string;
    channel: string;
    username: string;
    message: string;

    toJSON(): object[];
}
