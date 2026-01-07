import { ChatInputCommandInteraction, UserContextMenuCommandInteraction, MessageContextMenuCommandInteraction, MessageComponentInteraction, AnySelectMenuInteraction, ButtonInteraction, ComponentType, Interaction, MessageComponent } from "discord.js";
import CustomClient from "./CustomClient";
import IComponentInteraction from "../interfaces/IComponentInteraction";
import IComponentInteractionOptions from "../interfaces/IComponentInteractionOptions";


export default class ComponentInteraction implements IComponentInteraction {
    client: CustomClient;
    name: string;
    description: string;
    type: ComponentType;

    constructor(client: CustomClient, options: IComponentInteractionOptions) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.type = options.type;
    }

    Execute(interaction: MessageComponentInteraction | ButtonInteraction | AnySelectMenuInteraction): void {
    }
}
