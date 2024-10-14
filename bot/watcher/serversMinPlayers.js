const MinecraftQuery = require("minecraft-query");
const { getLocalDatabase } = require('../services/serverDatabase');
const { sendMessage, sendEmbedMessage } = require('../services/discord');
const { killServer } = require('../services/killServer');

require('dotenv').config()


let serversWarningList = {}

function addWarning(serverIp) {
    serversWarningList[serverIp] = serversWarningList[serverIp] + 1;
}

function getWarnings (serverIp) {
    if(serversWarningList[serverIp] === undefined) {
        serversWarningList[serverIp] = -1
        return -1;
    }
    return serversWarningList[serverIp];
}

/**
 * The function `watchServersMinPlayers` periodically checks the player count on Minecraft servers and
 * sends warnings if the count is below a specified threshold.
 * @returns The function `watchServersMinPlayers()` is returning a setInterval function that runs
 * asynchronously. This setInterval function iterates over tasks in a local database, retrieves server
 * information such as IP address, channel ID, and user ID, and then checks the number of players
 * currently on the server using a MinecraftQuery.
 */
function watchServersMinPlayers() {

  return setInterval(async () => {
    const localDatabase = getLocalDatabase();

    for(let taskArn in localDatabase) {
        let task = localDatabase[taskArn];
        let serverIp = task.publicIpAddress;
        let channelId = task.channelId
        let userId = task.userId

        try {
            const q = new MinecraftQuery({
                host: serverIp,
                port: 25565,
                timeout: 7500,
            });
    
    
            q.fullStat().then((data) => {
                q.close();
                let current_players_count = parseInt(data.online_players);
                let current_warnings = getWarnings(serverIp);
    
                if(current_warnings >= process.env.GAMESERVER_MIN_REQUIRED_PLAYERS_WARNING_COUNT) {
                    killServer(taskArn);
                    return
                }

                if(current_players_count < parseInt(process.env.GAMESERVER_MIN_REQUIRED_PLAYERS)) {
                    addWarning(serverIp);

                    if(current_warnings === -1) {return ;}
                    sendMessage(channelId, `[AVERTISSEMENT ${current_warnings+1}/${process.env.GAMESERVER_MIN_REQUIRED_PLAYERS_WARNING_COUNT}] Attention <@${userId}>, le serveur ${serverIp} n'a pas atteint le nombre de joueurs minimum requis. (${current_players_count}/${process.env.GAMESERVER_MIN_REQUIRED_PLAYERS}).`);
                }
    
            }).catch((err) => {
                // server initialization might not be over
                q.close();
            });

        }catch(e){
            // server initialization might not be over
        }

    }
  }, process.env.GAMESERVER_MIN_REQUIRED_PLAYERS_WARNING_DURATION);
}

module.exports = { watchServersMinPlayers };