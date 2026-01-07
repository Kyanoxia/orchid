import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface ISubCommand {
    client: CustomClient;
    name: string;

    Execute(interaction: ChatInputCommandInteraction): void;
}
