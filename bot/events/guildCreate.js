const { Events } = require('discord.js');

require('dotenv').config()


module.exports = {
	name: Events.GuildCreate,
	async execute(interaction) {
        if(interaction.id === process.env.DISCORD_GUILD_ID) return;
		console.log(`Joined guild ${interaction.name} and left`);
        await interaction.leave();
	},
};