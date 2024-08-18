require('dotenv').config()
const { sendMessage, sendEmbedMessage } = require('./discord');
const MinecraftQuery = require("minecraft-query");
const { getTaskDetails } = require('./serverDatabase');

/**
 * The function `checkServerReadiness` asynchronously checks the readiness of a Minecraft server and
 * sends a message with server details once it's ready.
 * @param serverIp - The `serverIp` parameter is the IP address of the server that you want to check
 * the readiness for. This function is designed to periodically query the Minecraft server at the
 * specified IP address to check if it is ready for use.
 * @param channelId - The `channelId` parameter in the `checkServerReadiness` function is used to
 * specify the unique identifier of the channel where messages will be sent to notify the user about
 * the server readiness and provide relevant information. It helps in directing the messages to the
 * correct channel within the communication platform being used,
 * @param taskArn - The `taskArn` parameter in the `checkServerReadiness` function is used to specify
 * the Amazon Resource Name (ARN) of a task. 
 */
const checkServerReadiness = async (serverIp, channelId, taskArn) => {
    const task = getTaskDetails(taskArn);

    let intervalId = setInterval(() => {
        const q = new MinecraftQuery({
            host: serverIp,
            port: 25565,
            timeout: 7500,
        });

        q.fullStat().then((data) => {
            q.close();
            sendMessage(channelId, `<@${task.userId}> Votre serveur est prêt. Il sera disponible pour une durée de 90 minutes. Vous trouverez ci-dessous les informations nécessaires pour vous connecter et administrer le serveur.`, );
                        
            sendEmbedMessage(channelId, "Votre serveur est prêt!", "Votre serveur est prêt et vous pouvez désormais vous y connecter.\n⚠️ Aucune carte n'est pré-installée. Vous devrez taper la commande /mcdownloader afin de télécharger les différentes cartes.\n👋 Afin de devenir administrateur du serveur, une commande est mise à disposition ci-dessous.\n🛑 Si le nombre de joueur minimum n'est pas atteint avec un certain nombre d'avertissement, le serveur sera coupé.",
                [
                    { name: "Adresse IP", value: serverIp, inline: true },
                    { name: "Version du serveur", value: process.env.GAMESERVER_VERSION, inline: true },
                    { name: "Nombre de joueurs minimum", value: process.env.GAMESERVER_MIN_REQUIRED_PLAYERS, inline: true  },
                    { name: "Type de serveur", value: task.typeServer, inline: true  },
                    { name: '\u200B', value: '\u200B' },
                    { name: "Commande Administrateur", value: `/opredeem ${task.token}` },
                    { name: "Télécharger une carte de jeu", value: `/mcdownloader` },
                    { name: '\u200B', value: '\u200B' },
                    { name: "Demandeur", value: `<@${task.userId}>` },
                ]
            )
            clearInterval(intervalId);
        }).catch((error) => {
            q.close();
        });
    }, 1000)
};

module.exports = { checkServerReadiness };