const { getLocalDatabase } = require('../services/serverDatabase');
const { killServer } = require('../services/killServer');

require('dotenv').config()


/**
 * The function `watchServerRunTime` periodically checks the run time of game servers in a local
 * database and kills them if they exceed a maximum duration specified in an environment variable.
 * @returns The `watchServerRunTime` function is returning a setInterval timer that runs every 1000
 * milliseconds (1 second). This timer checks the creation date of tasks in the local database and
 * kills the server if the current date exceeds the maximum duration set in the environment variable
 * `process.env.GAMESERVER_MAX_DURATION`.
 */
function watchServerRunTime() {
  return setInterval(async () => {
      const localDatabase = getLocalDatabase();
      for(let taskId in localDatabase){
          let task = localDatabase[taskId];
          
          let creationDate = task.creationDate;
          let currentDate = Date.now();
          if(currentDate > creationDate + process.env.GAMESERVER_MAX_DURATION){
              await killServer(taskId);
          }
          
      }
  }, 1000);
}

module.exports = { watchServerRunTime };