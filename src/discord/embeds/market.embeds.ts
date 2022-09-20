import { APIEmbedField } from "discord-api-types/v9";
import { EmbedField, MessageEmbed } from "discord.js";
import { MarketAccountData } from "../../markets";

export const accountDataEmbed = (data: MarketAccountData ) => {
    const accountDataEmbed = new MessageEmbed();
    const fields = [];
    
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key] 
            let field = {
                name: key,
                value: String(value),
                inline: false
            } as EmbedField
            console.log(field)
            fields.push(field);
        }
    }
    accountDataEmbed
        .setTitle(`Account data for account: ${data.accountNumber.substring(0,4)}XXXXX`)
        .setAuthor({
            name: 'bot of century'
        })
        .addFields(...fields)
    return accountDataEmbed;
}