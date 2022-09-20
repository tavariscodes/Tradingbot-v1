import { SlashCommandBuilder } from "@discordjs/builders";
import { DiscordCommand } from './index';

export default {
    data: new SlashCommandBuilder()
        .setName('watchlist')
        .setDescription('A watchlist with a set of sub-commands'),
    async execute(interaction) {
        if (interaction.isCommand()) {
            // do different watchlist commands
            await interaction.reply('PONG BIATCH!')
        }
    }
} as DiscordCommand;