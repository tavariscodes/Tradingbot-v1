import { Client, Collection, Intents } from 'discord.js';
import fs from 'node:fs';
import path from 'path';
import 'dotenv/config';
const {DISCORD_BOT_TOKEN, } = process.env
import { DiscordCommand } from './commands'

export interface ClientExtended<T> extends Client { 
    commands: Collection<string, DiscordCommand>
}

const commandDir = path.resolve('src/discord/commands')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] }) as ClientExtended<boolean>;
client.commands = new Collection();
const commandFiles = fs.readdirSync(commandDir).filter(file => !file.includes('index') && file.endsWith('.ts'));

for (const file of commandFiles) {
    const fullPath = path.resolve(`${commandDir}/${file}`);
    const command = require(fullPath).default;
    client.commands.set(command.data.name, command)
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command', 
            ephemeral: true
        });
    }
})

client.login(DISCORD_BOT_TOKEN);