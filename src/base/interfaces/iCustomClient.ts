import { Collection } from "discord.js";
import Command from "../classes/Command";
import IConfig from "./iConfig";
import SubCommand from "../classes/SubCommand";

export default interface ICustomClient {
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    developmentMode: boolean;

    init(): void;
    LoadHandlers(): void;
}
