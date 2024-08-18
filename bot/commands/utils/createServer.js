const { SlashCommandBuilder} = require('discord.js');
const { runECSTask } = require("../../services/createServer")
const { registerECSTask, getLocalDatabase } = require("../../services/serverDatabase")
const { createChannel, sendMessage } = require("../../services/discord")
const { checkServerReadiness } = require("../../services/serverReadinessCheck")
const { v4: uuidv4 } = require('uuid');

require('dotenv').config()


let usersCreatingServer = []

module.exports = {
	data: new SlashCommandBuilder()
		.setName('demander-serveur')
		.setDescription("Permet de demander la création d'un serveur MineralContest.")
		.addStringOption(option =>
			option.setName('type_serveur')
				.setDescription('Autoriser ou non les non officiels du jeu.')
				.setRequired(true)
				.addChoices(
					{ name: 'Non officiel (crack autorisé)', value: 'non_official' },
					{ name: 'Officiel', value: 'official' },
				)),
		
	async execute(interaction) {
		

		let localDatabase = getLocalDatabase();
		let member = interaction.member;
		let type_server = interaction.options.getString('type_serveur');
		let isAdmin = member.roles.cache.some(role => role.id === process.env.DISCORD_ADMIN_ROLE_ID);

		if (!member.roles.cache.some(role => (role.id === process.env.DISCORD_USER_ROLE_ID) || (role.id === process.env.DISCORD_ADMIN_ROLE_ID))) {
			await interaction.reply('Vous n\'avez pas la permission de demander la création d\'un serveur MineralContest.');
			return;
		}


		if(usersCreatingServer.includes(member.id) && !isAdmin){
			await interaction.reply({content: 'Vous avez déjà un serveur en cours de création.', ephemeral: true});
			return;
		}

		usersCreatingServer.push(member.id);

		for(let taskId in localDatabase){
			let task = localDatabase[taskId];
			if(task.userId === member.id && !isAdmin){
				await interaction.reply({content: 'Vous avez déjà un serveur.', ephemeral: true});
				return;
			}
		}
		
		await interaction.reply(
			{ 
				content: "La demande de création de serveur a bien été prise en compte. Un nouveau channel vient d'être crée.", 
			  	ephemeral: true
			}
		);

		const channelId = await createChannel(member.id, "🎮-Serveur-de-" + member.user.username);

		await sendMessage(channelId, `Bonjour <@${member.id}>, votre serveur est en cours de création. Veuillez patienter quelques instants...`, );

		let token = uuidv4();
		const taskDetails = await runECSTask("mineralcontest", [
			{ name: "OPREDEEM_TOKEN", value: token },
			{ name: "ALLOW_NON_OFFICIAL", value: (type_server == "non_official").toString()}
		]);

		await sendMessage(channelId, `Votre serveur est en cours de démarrage, merci de patienter. Cette opération peut durer plusieurs minutes.`, );

		await registerECSTask(taskDetails.taskArn, taskDetails.publicIpAddress, type_server, token, channelId, member.id);	
		
		await sendMessage(process.env.DISCORD_LOG_CHANNEL_ID, `Un nouveau serveur de type ${type_server} a été demandé par <@${member.id}>.`);

		checkServerReadiness(taskDetails.publicIpAddress, channelId, taskDetails.taskArn);

		usersCreatingServer = usersCreatingServer.filter(e => e !== member.id);
	},
};