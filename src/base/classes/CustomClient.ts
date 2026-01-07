import { Client, Collection } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";

import { configDotenv } from "dotenv";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { MikroORM, SqlEntityManager, AbstractSqlDriver, AbstractSqlConnection, AbstractSqlPlatform } from "@mikro-orm/better-sqlite";
import Modal from "./Modal";
import ComponentInteraction from "./ComponentInteraction";

configDotenv();

export default class CustomClient extends Client implements ICustomClient {
    token: string;
    handler: Handler;
    modals: Collection<string, Modal>;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    databases: Collection<string, MikroORM>;
    componentInteractions: Collection<string, ComponentInteraction>;
    cooldowns: Collection<string, Collection<string, number>>;

    constructor() {
        super({ intents: [] });

        console.log(`Constructing CustomClient`);

        this.token = process.env.TOKEN;

        if (!this.token) {
            throw new Error("TOKEN environment variable is not set.");
        }

        this.handler = new Handler(this);
        this.modals = new Collection();
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.databases = new Collection();
        this.componentInteractions = new Collection();
        this.cooldowns = new Collection();
    }
    
    async Init(): Promise<void> {
        await this.LoadHandlers();

        console.log("Logging in");
        try {
            await this.login(this.token);
            console.log(`Logged in as ${this.user?.displayName}!`)
        } catch (err) {
            console.error(err);
        }
    }

    async LoadHandlers(): Promise<void> {
        await this.handler.LoadEvents();
        await this.handler.LoadModals();
        await this.handler.LoadCommands();
        await this.handler.LoadDatabases();
        await this.handler.LoadComponentInteractions();
    }
}
