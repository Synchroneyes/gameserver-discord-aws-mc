// Import required AWS SDK clients and commands for Node.js
var aws_library = require("aws-sdk");
const { deleteEcsTask, getTaskDetails } = require("./serverDatabase");
const { deleteChannel } = require("./discord");

require('dotenv').config()


const params = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    }
}

// Create an ECS client service object
const ecsClient = new aws_library.ECS(params);

/**
 * The function `killECSTask` asynchronously stops an ECS task using the task ARN provided.
 * @param taskArn - The `taskArn` parameter in the `killECSTask` function is the Amazon Resource Name
 * (ARN) of the ECS task that you want to stop or kill. This ARN uniquely identifies the ECS task
 * within your AWS account and ECS cluster.
 * @returns The `killECSTask` function is returning the data object that is received after stopping the
 * ECS task specified by the `taskArn` parameter.
 */
const killECSTask = async (taskArn) => {
    const params = {
        cluster: process.env.AWS_ECS_CLUSTER_NAME,
        task: taskArn
    }

    const data = await ecsClient.stopTask(params).promise();

    return data;
}

/**
 * The function `killServer` asynchronously kills an ECS task, deletes the task, and deletes a channel
 * based on the task's details.
 * @param taskArn - The `taskArn` parameter is a unique identifier for a task in Amazon ECS
 * (Elastic Container Service). It is used to reference and perform operations on a specific task
 * within an ECS cluster.
 */
const killServer = async (taskArn) => {

    const details = await getTaskDetails(taskArn);

    await killECSTask(taskArn);
    await deleteEcsTask(taskArn)
    await deleteChannel(details.channelId);

}

module.exports = { killServer };