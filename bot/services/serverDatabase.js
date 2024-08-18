// Import required AWS SDK clients and commands for Node.js
var aws_library = require("aws-sdk");

require('dotenv').config()


const params = {
    region: process.env.AWS_REGION, 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    
}


aws_library.config.update(params);
const dynamoDbClient = new aws_library.DynamoDB.DocumentClient()

let localDatabase = {}

/**
 * The function `registerECSTask` stores task information in both DynamoDB and a local database.
 * @param taskArn - The `taskArn` parameter in the `registerECSTask` function represents the Amazon
 * Resource Name (ARN) of the ECS task that you want to register. This ARN uniquely identifies the ECS
 * task within AWS.
 * @param publicIpAddress - The `publicIpAddress` parameter in the `registerECSTask` function
 * represents the public IP address associated with the ECS task being registered. This IP address is
 * used to access the ECS task from outside the ECS cluster, allowing external communication with the
 * task.
 * @param type_server - The `type_server` parameter in the `registerECSTask` function likely represents
 * the type or category of server being registered. It could be used to specify the purpose or
 * configuration of the server within the context of the ECS task being registered. This information
 * can help differentiate between different types of servers or
 * @param token - The `token` parameter in the `registerECSTask` function is used to store a token
 * associated with the task being registered.
 * @param channelId - The `channelId` parameter in the `registerECSTask` function represents the unique
 * identifier of the channel associated with the task being registered. It is used to store information
 * about the channel where the task is being executed.
 * @param userId - The `userId` parameter in the `registerECSTask` function represents the unique
 * identifier of the user who is registering the ECS task. This identifier is used to associate the ECS
 * task with a specific user in the system.
 * @returns The `registerECSTask` function is returning the `localDatabase` object after adding a new
 * entry based on the provided parameters. The new entry includes the task ID, public IP address,
 * token, creation date, channel ID, server type, and user ID.
 */
const registerECSTask = async (taskArn, publicIpAddress, type_server, token, channelId, userId) => {

    const params = {
        TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
        Item: {
            "taskId": taskArn,
            "publicIpAddress": publicIpAddress,
            "token": token,
            "creationDate": Date.now(),
            "channelId": channelId,
            "typeServer": type_server,
            "userId": userId
        }
    }

    const data = await dynamoDbClient.put(params).promise();

    localDatabase[taskArn] = {taskId: taskArn, publicIpAddress: publicIpAddress, typeServer: type_server, token: token, creationDate: Date.now(), channelId: channelId, userId: userId};

    return localDatabase;

}

/**
 * The function `deleteEcsTask` deletes a task from a DynamoDB table and removes it from a local
 * database.
 * @param taskArn - The `taskArn` parameter in the `deleteEcsTask` function is the Amazon Resource Name
 * (ARN) of the ECS task that you want to delete from both DynamoDB and a local database.
 * @returns The `deleteEcsTask` function is returning the `localDatabase` object after deleting the
 * task with the specified `taskArn` from both the DynamoDB table and the `localDatabase` object.
 */
const deleteEcsTask = async (taskArn) => {
    const data = await dynamoDbClient.delete({ TableName: process.env.AWS_DYNAMODB_TABLE_NAME, Key: { taskId: taskArn } }).promise();
    delete localDatabase[taskArn];
    return localDatabase;
}   


/**
 * The function `getECSTasks` retrieves data from a DynamoDB table and organizes it into a local
 * database based on task IDs.
 * @returns The `getECSTasks` function is returning an object `localDatabase` that contains task
 * information stored in a DynamoDB table. The object has properties for each task ID, with values that
 * include the task ID, public IP address, server type, token, creation date, channel ID, and user ID
 * for each task.
 */
const getECSTasks = async () => {
    const data = await dynamoDbClient.scan({ TableName: process.env.AWS_DYNAMODB_TABLE_NAME }).promise();

    localDatabase = {}

    for(let index in data.Items){
        let item = data.Items[index]
        if(localDatabase[item.taskId] === undefined){
            localDatabase[item.taskId] = {taskId: item.taskId, publicIpAddress: item.publicIpAddress, typeServer: item.typeServer, token: item.token, creationDate: item.creationDate, channelId: item.channelId, userId: item.userId};
        }
    }

    return localDatabase;
}

/**
 * The function `getTaskDetails` retrieves task details from a local database based on the task ARN
 * provided as input.
 * @param taskArn - The `taskArn` parameter in the `getTaskDetails` function is a unique
 * identifier for a specific task in the local database. It is used to look up and retrieve details or
 * information related to that particular task from the database.
 * @returns The `getTaskDetails` function is returning the task details stored in the `localDatabase`
 * object corresponding to the `taskArn` key.
 */
const getTaskDetails = (taskArn) => {
    return localDatabase[taskArn];
}


const getLocalDatabase = () => {
    return localDatabase;
}

module.exports = { registerECSTask, deleteEcsTask, getECSTasks, getLocalDatabase, getTaskDetails };
