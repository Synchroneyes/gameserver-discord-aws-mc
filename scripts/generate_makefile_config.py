import inquirer
import argparse


def generate_config_file(args):
    # Define the questions with defaults from command-line arguments or provided default values
    questions = [
        inquirer.Text(
            "STACK_NAME",
            message="Enter the Stack Name",
            default=args.stack_name or "mineralcontest-bot-stack",
        ),
        inquirer.Text(
            "TEMPLATE_FILE",
            message="Enter the Template File Path",
            default=args.template_file
            or "infrastructure/cloudformation/remote-state-stack.yaml",
        ),
        inquirer.Text(
            "TERRAFORM_FOLDER",
            message="Enter the Terraform Folder Path",
            default=args.terraform_folder or "infrastructure",
        ),
        inquirer.Text(
            "TERRAFORM_COMMAND",
            message="Enter the Terraform Command",
            default=args.terraform_command or "terraform",
        ),
        inquirer.Text(
            "AWS_REGION",
            message="Enter the AWS Region",
            default=args.aws_region or "eu-west-1",
        ),
        inquirer.Text(
            "S3_BUCKET_NAME",
            message="Enter the S3 Bucket Name",
            default=args.s3_bucket_name or "mineralcontest-bot-remote-state",
        ),
        inquirer.Text(
            "DYNAMODB_TABLE_NAME",
            message="Enter the DynamoDB Table Name",
            default=args.dynamodb_table_name or "mineralcontest-bot-remote-state-lock",
        ),
        inquirer.Text(
            "ECR_REPOSITORY_NAME",
            message="Enter the ECR Repository Name",
            default=args.ecr_repository_name or "mineralcontest",
        ),
        inquirer.Text(
            "ECS_CLUSTER_NAME",
            message="Enter the ECS Cluster Name",
            default=args.ecs_cluster_name or "mineralcontest-bot-cluster",
        ),
        inquirer.Text(
            "BOT_FOLDER",
            message="Enter the Bot Folder Path",
            default=args.bot_folder or "bot",
        ),
        inquirer.Text(
            "GAMESERVER_FOLDER",
            message="Enter the GameServer Docker Folder Path",
            default=args.gameserver_folder or "docker",
        ),
    ]

    # Collect answers interactively
    answers = inquirer.prompt(questions)

    # Define the output file name
    output_file = "../Makefile.config"

    # Write the data to the file
    with open(output_file, "w") as file:
        for key, value in answers.items():
            file.write(f'{key}="{value}"\n')

    print(f"Configuration file '{output_file}' has been generated successfully.")


if __name__ == "__main__":
    # Set up argument parsing
    parser = argparse.ArgumentParser(description="Generate a .env configuration file.")
    parser.add_argument("--stack_name", type=str, help="Specify the Stack Name")
    parser.add_argument(
        "--template_file", type=str, help="Specify the Template File Path"
    )
    parser.add_argument(
        "--terraform_folder", type=str, help="Specify the Terraform Folder Path"
    )
    parser.add_argument(
        "--terraform_command", type=str, help="Specify the Terraform Command"
    )
    parser.add_argument("--aws_region", type=str, help="Specify the AWS Region")
    parser.add_argument("--s3_bucket_name", type=str, help="Specify the S3 Bucket Name")
    parser.add_argument(
        "--dynamodb_table_name", type=str, help="Specify the DynamoDB Table Name"
    )
    parser.add_argument(
        "--ecr_repository_name", type=str, help="Specify the ECR Repository Name"
    )
    parser.add_argument(
        "--ecs_cluster_name", type=str, help="Specify the ECS Cluster Name"
    )
    parser.add_argument("--bot_folder", type=str, help="Specify the Bot Folder Path")
    parser.add_argument(
        "--gameserver_folder", type=str, help="Specify the Game Server Folder Path"
    )

    # Parse arguments
    args = parser.parse_args()

    # Generate the configuration file
    print("##################################################")
    print("Global Configuration helper.")
    print("##################################################")
    generate_config_file(args)
