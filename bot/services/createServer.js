// Import required AWS SDK clients and commands for Node.js
var aws_library = require("aws-sdk");
const { getLatestTaskDefinition } = require('./ecs.js');
const { getSSMParameterValue } = require('./ssm.js');
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

const ec2Client = new aws_library.EC2(params);

/**
 * The `runECSTask` function is used to run a task on AWS ECS using Fargate launch type with specified
 * parameters and returns the public IP address and task ARN.
 * @param taskDefinition - The `taskDefinition` parameter in the `runECSTask` function is the name of
 * the ECS task definition that you want to run. It is used to specify which task definition should be
 * used for the ECS task.
 * @param containersEnvironment - The `containersEnvironment` parameter in the `runECSTask` function is
 * an object that contains environment variables to be passed to the container running in the ECS task.
 * These environment variables can be accessed within the containerized application to configure its
 * behavior or settings based on the environment.
 * @returns The function `runECSTask` returns an object with two properties:
 * 1. "publicIpAddress": The public IP address associated with the task's network interface.
 * 2. "taskArn": The ARN (Amazon Resource Name) of the task that was started.
 */
const runECSTask = async (taskDefinition, containersEnvironment) => {
    // Create the RunTaskCommand with the necessary parameters

    const subnetId = await getSSMParameterValue("/mineralcontest/subnet_id");
    const securityGroupId = await getSSMParameterValue("/mineralcontest/securitygroup_id");

    const taskVersion = await getLatestTaskDefinition(taskDefinition);
    const runTaskParams = {
        cluster: process.env.AWS_ECS_CLUSTER_NAME,
        taskDefinition: taskDefinition + ":" + taskVersion.revision,
        launchType: "FARGATE",
        overrides: {
            cpu: "2048",
            memory: "4096",
            containerOverrides: [
                {
                    cpu: "2048",
                    memory:"4096",
                    name: process.env.DOCKER_IMAGE_NAME,
                    environment: containersEnvironment
                }
            ]
        },
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: [
                    subnetId
                ],
                securityGroups: [
                    securityGroupId
                ],
                assignPublicIp: "ENABLED"
            }
        },
        
        

        count: 1,
    };

    try {

        const data = await ecsClient.runTask(runTaskParams).promise();
        const waitTaskRunning = await ecsClient.waitFor("tasksRunning", { cluster: process.env.AWS_ECS_CLUSTER_NAME, tasks: [data["tasks"][0]["taskArn"]] }).promise();
        const taskData = await ecsClient.describeTasks({
            cluster: process.env.AWS_ECS_CLUSTER_NAME,
            tasks: [data["tasks"][0]["taskArn"]],
        }).promise();

        const responseIp = await ec2Client.describeNetworkInterfaces({
            Filters: [
                {
                    Name: "private-ip-address",
                    Values: [taskData.tasks[0].containers[0].networkInterfaces[0].privateIpv4Address]
                }
            ]
        }).promise();

        return {
            "publicIpAddress": responseIp.NetworkInterfaces[0].Association.PublicIp,
            "taskArn": data["tasks"][0]["taskArn"]
        }
        
    } catch (err) {
        console.error("Error starting task:", err);
    }
};

module.exports = { runECSTask };