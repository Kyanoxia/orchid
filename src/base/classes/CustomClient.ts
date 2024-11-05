import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/iCustomClient";
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
        console.log(`Starting the bot in ${this.developmentMode ? "Development" : "Production"} mode`);
        this.LoadHandlers();

        this.login(process.env.token)
            .catch((err) => console.error(err));
        
        connect(process.env.mongoURL)
            .then(() => console.log(`Connected to MongoDB`))
            .catch((err) => console.error(err));
    }

    LoadHandlers(): void {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }
}
