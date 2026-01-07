import IHandler from "../interfaces/IHandler";
import path from 'path';
import { glob } from "glob";
import CustomClient from "./CustomClient";
import Event from "./Event";
import SubCommand from "./SubCommand";
import Command from "./Command";
import { MikroORM } from "@mikro-orm/better-sqlite";
import Modal from "./Modal";
import ComponentInteraction from "./ComponentInteraction";
import { Migrator } from "@mikro-orm/migrations";

export default class Handler implements IHandler {
    client: CustomClient;

    constructor(client: CustomClient) {
        this.client = client;
    }

    async LoadEvents() {
        console.log("Scanning for Events");
        const files = (await glob(`build/src/events/**/*.js`)).map((filePath: string) => path.resolve(filePath));

        for (const file of files) {
            const event: Event = new (await import(file)).default(this.client);

            if (!event.name) {
                console.log(`${file.split("/").pop()} does not have a name`);
                delete require.cache[require.resolve(file)];
            }

            const execute = (...args: any) => event.Execute(...args);

            console.log(`Handing off event "${event.name}" (${event.description}) to discord.js - ${file}`);
            //@ts-ignore
            if (event.once) this.client.once(event.name, execute);
            //@ts-ignore
            else this.client.on(event.name, execute);

            delete require.cache[require.resolve(file)];
        }
    }

    async LoadModals() {
        console.log("Scanning for modals");
        const files = (await glob(`build/src/modals/**/*.js`)).map((filePath: string) => path.resolve(filePath));

        for (const file of files)
        {
            const modal: Modal = new (await import(file)).default(this.client);

            if (!modal.custom_id) {
                console.log(`${file.split("/").pop()} does not have a name`);
                return delete require.cache[require.resolve(file)];
            }

            this.client.modals.set(modal.custom_id, modal as Modal);
            console.log(`Handing off command "${modal.custom_id}" to client - ${file}`);

            delete require.cache[require.resolve(file)];
        }
    }

    async LoadCommands() {
        console.log("Scanning for commands");
        const files = (await glob(`build/src/commands/**/*.js`)).map((filePath: string) => path.resolve(filePath));

        for (const file of files)
        {
            const command: Command | SubCommand = new (await import(file)).default(this.client);

            if (!command.name) {
                console.log(`${file.split("/").pop()} does not have a name`);
                delete require.cache[require.resolve(file)];
                continue;
            }

            if (file.split("/").pop()?.split(".")[2]) {
                this.client.subCommands.set(command.name, command);
                console.log(`Handing off command "${command.name}" to client - ${file}`); 
                continue;
            }

            this.client.commands.set(command.name, command as Command);
            console.log(`Handing off command "${command.name}" to client - ${file}`);

            delete require.cache[require.resolve(file)];
        }
    }

    async LoadDatabases() {
        console.log("Scanning for Databases")
        const files = (await glob(`build/src/databases/**/configs/*.config.js`)).map((filePath: string) => path.resolve(filePath));

        for (const file of files)
        {
            const database = (await import(file)).default;

            if (!database.name) {
                console.log(`${file.split("/").pop()} does not have a name key in it's config`);
                return delete require.cache[require.resolve(file)];
            }

            console.log(`Initializing Database "${database.name}"`);
            const orm = await MikroORM.init(database);

            database.extensions = database.extensions || [];
            if (!database.extensions.includes(Migrator)) {
                database.extensions.push(Migrator);
            }

            try {
                // Check if there are any existing migrations in the database
                // The `getPending` method checks for migrations that have been created but not yet executed.
                const executedMigrations = await orm.migrator.getExecutedMigrations();
                const pendingMigrations = await orm.migrator.getPendingMigrations();

                if (executedMigrations.length === 0 && pendingMigrations.length === 0) {
                    console.warn('No migrations found, generating initial migration. This will overwrite your database...');

                    const diff = await orm.schema.getUpdateSchemaSQL();

                    if (diff) {
                        console.warn('Schema is out of sync. Generated SQL to update:', diff);
                        console.log("Updating schema");
                        orm.schema.updateSchema();
                    } else {
                        console.log('Schema is up-to-date.');
                    }
        
                    await orm.migrator.createInitialMigration(); 
                    console.log('Initial migration generated successfully.');
                } else {
                    console.log('Existing migrations found, skipping initial migration generation.');
                }
            } catch (error) {
                console.warn('Could not check/create initial migration:', error);
                // Depending on your error handling, you might rethrow or handle more gracefully.
                // For instance, if the schema exists but is not aligned with metadata,
                // createInitialMigration() might fail.
            }

            if (orm.migrator && await orm.migrator.checkMigrationNeeded()) {
                console.log("Running pending migrations...");
                await orm.migrator.up();
                console.log("Migrations complete.")
            }
            
            console.log(`Handing off database "${database.name}" to client - ${file}`);
            this.client.databases.set(database.name, orm);

            delete require.cache[require.resolve(file)];
        }
    }

    async LoadComponentInteractions() {
        console.log("Scanning for Component Interactions");
        const files = (await glob(`build/src/component_interactions/**/*.js`)).map((filePath: string) => path.resolve(filePath));

        for (const file of files)
        {
            const componentInteraction: ComponentInteraction = new (await import(file)).default(this.client);

            if (!componentInteraction.name) {
                console.log(`${file.split("/").pop()} does not have a name`);
                return delete require.cache[require.resolve(file)];
            }

            this.client.componentInteractions.set(componentInteraction.name, componentInteraction as ComponentInteraction);
            console.log(`Handing off Component Interaction "${componentInteraction.name}" (${componentInteraction.description}) to client - ${file}`);

            delete require.cache[require.resolve(file)];
        }
    }
}
