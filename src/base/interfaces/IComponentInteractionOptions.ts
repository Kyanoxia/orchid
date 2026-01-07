import { AnySelectMenuInteraction, ButtonInteraction, ComponentType, Interaction, MessageComponentInteraction } from "discord.js";
import ComponentInteraction from "../classes/ComponentInteraction";

export default interface IComponentInteractionOptions {
    name: string;
    description: string;
    type: ComponentType;
}
