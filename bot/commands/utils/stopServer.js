const { SlashCommandBuilder} = require('discord.js');
const { getLocalDatabase } = require('../../services/serverDatabase');
const {getUser} = require('../../services/discord');
const { killServer } = require('../../services/killServer');

require('dotenv').config()


async function getAdminAutocomplete() {
    let localDatabase = getLocalDatabase();
    let choices = [];
    for(let taskId in localDatabase){
        let task = localDatabase[taskId];
        let member = await getUser(task.userId);
        choices.push({name: "Serveur de " + member.user.globalName, value: taskId});
    }
    return choices;
}

async function getUserAutocomplete(userId) {
    let localDatabase = getLocalDatabase();
    let choices = [];
    for(let taskId in localDatabase){
        let task = localDatabase[taskId];
        if(task.userId === userId){
            choices.push({name: "Mon serveur", value: taskId});
        }
    }
    return choices;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop-serveur')
		.setDescription("Permet de stopper le serveur Minecraft à la demande.")
		.addStringOption(option =>
			option.setName('serveur')
				.setDescription('Quel serveur est à stopper ?')
                .setRequired(true)
				.setAutocomplete(true)),

    async autocomplete(interaction){
        let member = interaction.member;

        let isAdmin = member.roles.cache.some(role => role.id === process.env.DISCORD_ADMIN_ROLE_ID);

        if(isAdmin) choices = await getAdminAutocomplete();
        else choices = await getUserAutocomplete(member.id);

        if(choices.length === 0){
            choices.push({name: "Il n'y a aucun serveur à arrêter", value: "none"})
        }

		await interaction.respond(
			choices.map(choice => ({ name: choice.name, value: choice.value })),
		);
    },
		
	async execute(interaction) {
        let localDatabase = getLocalDatabase();
		let member = interaction.member;
        let serverToKill = interaction.options.getString('serveur');

        if(serverToKill === 'none'){
            await interaction.reply({ content: "Il n'y a aucun serveur à arrêter.", ephemeral: true });
            return
        }

        if(!localDatabase[serverToKill]){
            await interaction.reply({ content: "Le serveur n'existe pas.", ephemeral: true });
            return;
        }

        if(localDatabase[serverToKill].userId !== member.id && !member.roles.cache.some(role => role.id === process.env.DISCORD_ADMIN_ROLE_ID)){
            await interaction.reply({ content: "Vous n'avez pas la permission de stopper ce serveur.", ephemeral: true });
            return;
        }

        await killServer(interaction.options.getString('serveur'));
        await interaction.reply({ content: "Le serveur a bien été stoppé.", ephemeral: true });
	},
};