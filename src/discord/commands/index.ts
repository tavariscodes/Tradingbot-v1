import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import { TradingBot } from '../../bot';

export interface DiscordCommand { 
    data: SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: Interaction) => void;
}

export * from './watchlist.commands';