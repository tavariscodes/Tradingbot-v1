import { Client, Collection, Intents } from 'discord.js';
import fs, { cp } from 'node:fs';
import path from 'path';
import 'dotenv/config';
const {DISCORD_BOT_TOKEN, } = process.env
import { DiscordCommand } from './commands'
import { TradingBot } from '../bot';
import { createConnection, getConnection } from 'typeorm';
import { Profile } from '../database/entity/profile.entity';


export const connection = createConnection()

export interface ClientExtended<T> extends Client { 
    commands: Collection<string, DiscordCommand>
}
// establish database connection

const commandDir = path.resolve('src/discord/commands')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] }) as ClientExtended<boolean>;
client.commands = new Collection();
const commandFiles = fs.readdirSync(commandDir).filter(file => !file.includes('index') && file.endsWith('.ts'));

for (const file of commandFiles) {
    const fullPath = path.resolve(`${commandDir}/${file}`);
    const command = require(fullPath).default;
    client.commands.set(command.data.name, command)
}

client.once('ready', async () => {
	console.log('Ready!');
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    // if user has an instance running call to initiate it here. If not 
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    // try to find user's profile if exists
    // if doesn't exist create one.
    const discordId = interaction.user.id;
    const name = interaction.user.username;
    const userProfile = await getConnection().getMongoRepository(Profile).findOne({
        discordId,
    });
    if (!userProfile) {
        try {
            await getConnection().getMongoRepository(Profile).save({
                discordId,
                name
            });
        } catch(err) {
            console.log(err);
            await interaction.reply('The bot is having trouble saving you in the system, please try again.')
        }
    }
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command', 
            ephemeral: true
        });
    }
});

client.login(DISCORD_BOT_TOKEN);