const { Events } = require('discord.js');

require('dotenv').config()


module.exports = {
	name: Events.MessageCreate,
	async execute(interaction) {
        if(interaction.content.includes(process.env.DISCORD_SERVER_OWNER_ID) && !interaction.author.bot && process.env.DISCORD_BLOCK_OWNER_MENTION === 'true') {
            await interaction.delete();
        }
	},
};