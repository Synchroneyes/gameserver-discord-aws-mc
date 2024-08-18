const { Events, ActivityType  } = require('discord.js');
const { getECSTasks } = require('../services/serverDatabase');
const { init, leaveUnwantedGuilds } = require('../services/discord');
const { watchServerRunTime } = require('../watcher/serversRunTime');
const { watchServersMinPlayers } = require('../watcher/serversMinPlayers');


module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await init(client.guilds);
		await leaveUnwantedGuilds(client);
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setPresence(
			{
				activities: [{ name: `/demander-serveur pour créer votre propre serveur`, type: ActivityType.Custom }],
				status: 'online'
			}
		);

		await getECSTasks()

		watchServerRunTime();
		watchServersMinPlayers();

		
	},
};