import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/iCustomClient";
import IConfig from "../interfaces/iConfig";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { connect } from "mongoose";
import { configDotenv } from "dotenv";

configDotenv();

export default class CustomClient extends Client implements ICustomClient
{
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    developmentMode: boolean;

    constructor()
    {
        super({intents: [GatewayIntentBits.Guilds]})
        
        this.handler = new Handler(this);
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.cooldowns = new Collection();
        this.developmentMode = (process.argv.slice(2).includes("--development"));
    }

    init(): void {
        console.log(`[LOG // STATUS] Starting the bot in ${this.developmentMode ? "Development" : "Production"} mode`);
        this.LoadHandlers();

        this.login(this.developmentMode ? process.env.devToken : process.env.token)
            .catch((err) => console.error(err));
        
        connect(this.developmentMode ? process.env.devMongoURL : process.env.mongoURL)
            .then(() => console.log("[LOG // SUCCESS] Connected to MongoDB"))
            .catch((err) => console.error(err));
    }

    LoadHandlers(): void {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }
}
