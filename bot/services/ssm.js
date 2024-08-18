var aws_library = require("aws-sdk");

const params = {
    region: process.env.AWS_REGION, 
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    }
}

const ssm = new aws_library.SSM(params);

/**
 * The function `getSSMParameterValue` asynchronously retrieves a parameter value from AWS Systems
 * Manager Parameter Store.
 * @param parameter_name - The `getSSMParameterValue` function you provided is an asynchronous function
 * that retrieves a parameter value from AWS Systems Manager Parameter Store. It takes a
 * `parameter_name` as input and returns a Promise that resolves to the parameter value.
 * @returns The `getSSMParameterValue` function is returning a promise that resolves to the value of
 * the SSM parameter specified by the `parameter_name`.
 */
const getSSMParameterValue = async (parameter_name) => {
    // Define the parameters for the getParameter method
    const params = {
        Name: parameter_name,
        WithDecryption: true // Set to true if the parameter is encrypted
    };

    // Fetch the parameter using .promise() and return the promise
    return ssm.getParameter(params).promise()
        .then(data => {
            // Return the parameter value
            return data.Parameter.Value;
        })
        .catch(error => {
            console.error(`Error fetching SSM parameter: ${error.message}`);
            throw error;
        });
}
module.exports = {getSSMParameterValue};