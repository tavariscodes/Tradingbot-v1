import Alpaca from "@alpacahq/alpaca-trade-api";
import { SlashCommandBuilder } from "@discordjs/builders";
import { TradingBot, TradingBotCredentials } from "../../bot";
import { DiscordCommand } from './index';
import { Profile } from "../../database/entity/profile.entity";
import { getConnection } from "typeorm";
import { accountDataEmbed } from '../embeds';

export default {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('Market command to use for getting symbol data and initiating buy and sell orders')
        .addSubcommand(subCommand =>
            subCommand
                .setName('account')
                .setDescription('returns your current market account balance and related information')
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('use')
                .setDescription('set a market to use')
                .addStringOption(option => option.setName('market').setDescription("market to use").setRequired(true))
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('set')
                .setDescription('Set api credentials for desired market')
                .addStringOption(option => option.setName('market').setDescription("market to save credentials").setRequired(true))
                .addStringOption(option => option.setName('clientid').setDescription("your trading account client id").setRequired(true))
                .addStringOption(option => option.setName('apikey').setDescription("your trading account api key").setRequired(true))
        ),
    async execute(interaction) {
        if (interaction.isCommand()) {
            // Market
            const username = interaction.user.username;
            const { name: subCommand, options } = interaction.options.data[0]
            if (subCommand === 'use') {
                const selectedMarket = options[0].value.toString().toLowerCase();
                if (selectedMarket === 'alpaca') {
                    const tradingBot = TradingBot.getInstance();
                    const foundUser = await getConnection().getMongoRepository(Profile).findOne({ name: username });
                    if (foundUser) {
                        if (foundUser.hasOwnProperty('marketsCredentials')) {
                            const marketCredentials = foundUser.marketsCredentials.find(credentials => credentials.marketName === 'alpaca');
                            if (marketCredentials) {
                                if (!tradingBot.hasCredentials()) {
                                    tradingBot.setCredentials(marketCredentials)
                                }
                                tradingBot.setMarket(selectedMarket)
                                await interaction.reply(`Market has successfully been set to: ${selectedMarket} you can now use /market commands`);
                            }
                        } else {
                            await interaction.reply("You do not have an ApiKey save for this market please use `/market set` command to set an api key");
                        }
                    }
                } else {
                    await interaction.reply(`Error: bot does not support market: \`${selectedMarket}\``)
                }
            }
            if (subCommand === 'set') {
                const apiKey = options.find(option => option.name === 'apikey').value;
                const marketName = options.find(option => option.name === 'market').value;
                const clientId = options.find(option => option.name === 'clientid').value;
                const marketCredentials = {
                    clientSecret: apiKey,
                    marketName,
                    clientId,
                } as TradingBotCredentials;

                const dbConnection = await getConnection();
                const tradingBot = await TradingBot.getInstance();
                // we should encrypt these keys before we save them. 
                const updateObject = {
                    $set: {
                        marketSet: true,
                        marketsCredentials: [
                            marketCredentials
                        ]
                    }
                }
                try {
                    await dbConnection
                        .getMongoRepository(Profile)
                        .findOneAndUpdate({ name: username }, updateObject)
                    tradingBot.setCredentials(marketCredentials)
                    await interaction.reply("Credentials updated and have successfully been saved.");
                } catch (err) {
                    console.error(err);
                    await interaction.reply("Unable to process request. Please try again");
                }

            }
            if (subCommand === 'account') {
                const tradingBot = TradingBot.getInstance()
                const foundUser = await getConnection()
                    .getMongoRepository(Profile).findOne({ name: interaction.user.username });
                if (foundUser.marketSet) {
                    console.log("user has a market set")
                    if (!tradingBot.hasCredentials()) {
                        const setMarketCredentials = foundUser.marketsCredentials.find(market => market.marketName === 'alpaca');
                        tradingBot.setCredentials(setMarketCredentials)
                    }
                    tradingBot.setMarket('alpaca');
                }
                try {
                    const accountData = await tradingBot.market.getAccountData();
                    const replyEmbed = accountDataEmbed(accountData);
                    await interaction.channel.send({ embeds: [replyEmbed]})
                } catch (err) {
                    if (typeof err === 'string') {
                        if (err.includes('403')) {
                            await interaction.reply("You are not authorized to access data for this account try again, set a different market, or update apikey")
                            console.error("Request unauthorized.");
                        }
                    } else {
                        console.error(err);
                    }
                }

            }
        }
    }
} as DiscordCommand;