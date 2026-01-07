import { Swaggify } from '@custom/PrettyConsole';
import { configDotenv } from 'dotenv';
import { ShardingManager } from 'discord.js';
import UptimeServer from '@custom/UptimeSocket';

configDotenv();
new Swaggify();

const manager = new ShardingManager('./build/src/bot.js', { token: process.env.TOKEN });
manager.on('shardCreate', shard => console.log(`Spawned new shard ${shard.id}`));

manager.spawn();

// new UptimeServer("Orchid", 8080, { version: "2.0.0" });
