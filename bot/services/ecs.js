var aws_library = require("aws-sdk");

const params = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    }
}

const ecs = new aws_library.ECS(params);

/**
 * The function `getLatestTaskDefinition` retrieves the latest task definition for a given task
 * definition name in an ECS cluster.
 * @param taskDefinitionName - The `taskDefinitionName` parameter is the name of the task definition
 * family for which you want to retrieve the latest task definition. The function
 * `getLatestTaskDefinition` uses this parameter to search for the latest task definition within the
 * specified family.
 * @returns The `getLatestTaskDefinition` function is returning a promise that resolves to the latest
 * task definition object for a given task definition name.
 */
const getLatestTaskDefinition = async (taskDefinitionName) => {
    return ecs.listTaskDefinitions({
        familyPrefix: taskDefinitionName,
        sort: 'DESC',
        maxResults: 1
    }).promise()
        .then(data => {
            if (!data.taskDefinitionArns || data.taskDefinitionArns.length === 0) {
                throw new Error(`No task definitions found for family: ${taskDefinitionName}`);
            }

            const latestTaskDefinitionArn = data.taskDefinitionArns[0];

            return ecs.describeTaskDefinition({
                taskDefinition: latestTaskDefinitionArn
            }).promise();
        })
        .then(data => data.taskDefinition)
        .catch(error => {
            console.error('Error getting the latest task definition:', error);
            throw error;
        });
}

const getClusterARN = async (clusterName) => {
    return ecs.listClusters().promise()
        .then(data => {
            const clusterARN = data.clusterArns.find(clusterArn => clusterArn.includes(clusterName));
            if (!clusterARN) {
                throw new Error(`No cluster found with name: ${clusterName}`);
            }
            return clusterARN;
        })
        .catch(error => {
            console.error('Error getting the cluster ARN:', error);
            throw error;
        });
}
module.exports = { getLatestTaskDefinition, getClusterARN };