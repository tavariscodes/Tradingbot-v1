import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';

export interface DiscordCommand { 
    data: SlashCommandBuilder;
    execute: (interaction: Interaction ) => void;
}
export * from './watchlist';