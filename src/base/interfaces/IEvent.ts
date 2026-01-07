import { Events } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface IEvent {
    client: CustomClient;
    name: Events;
    description: string;
    once: boolean;
}
