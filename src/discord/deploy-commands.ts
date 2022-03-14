import  fs from 'node:fs';
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import "dotenv/config";
import path from 'path';
const {DISCORD_BOT_TOKEN, DISCORD_BOT_CLIENT_ID, DISCORD_BOT_GUILD_ID } = process.env;

// Create a new client instance
const commandDir = path.resolve('src/discord/commands')
const commands = [];
const commandFiles = fs.readdirSync(commandDir).filter(file => !file.includes('index') && file.endsWith('.ts'));

for (const file of commandFiles) {
	const fullPath = path.join(commandDir, file);
    const command = require(fullPath).default;
	commands.push(command.data.toJSON());
}
const rest = new REST({ version: '9' }).setToken(DISCORD_BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(DISCORD_BOT_CLIENT_ID, DISCORD_BOT_GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
