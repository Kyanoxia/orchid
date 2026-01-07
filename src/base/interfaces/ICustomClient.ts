import { Collection } from "discord.js";
import Command from "../classes/Command";
import SubCommand from "../classes/SubCommand";
import { MikroORM } from "@mikro-orm/better-sqlite";
import Modal from "../classes/Modal";
import ComponentInteraction from "../classes/ComponentInteraction";

export default interface ICustomClient {
    token: string;
    modals: Collection<string, Modal>;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    databases: Collection<string, MikroORM>;
    componentInteractions: Collection<string, ComponentInteraction>;
    cooldowns: Collection<string, Collection<string, number>>;

    Init(): Promise<void>;
    LoadHandlers(): Promise<void>;
}
