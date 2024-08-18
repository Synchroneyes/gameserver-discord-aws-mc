import inquirer
import argparse


def generate_config_file(args):
    # Define the questions with defaults from command-line arguments
    questions = [
        inquirer.Text(
            "DISCORD_TOKEN",
            message="Enter the Discord Token",
            default=args.discord_token,
        ),
        inquirer.Text(
            "DISCORD_CLIENT_ID",
            message="Enter the Discord Client ID",
            default=args.discord_client_id,
        ),
        inquirer.Text(
            "DISCORD_GUILD_ID",
            message="Enter the Discord Guild ID",
            default=args.discord_guild_id,
        ),
        inquirer.Text(
            "DISCORD_ADMIN_ROLE_ID",
            message="Enter the Discord Admin Role ID",
            default=args.discord_admin_role_id,
        ),
        inquirer.Text(
            "DISCORD_USER_ROLE_ID",
            message="Enter the Discord User Role ID",
            default=args.discord_user_role_id,
        ),
        inquirer.Text(
            "DISCORD_GAMESERVER_CATEGORY_ID",
            message="Enter the Discord Game Server Category ID",
            default=args.discord_gameserver_category_id,
        ),
        inquirer.Text(
            "DISCORD_LOG_CHANNEL_ID",
            message="Enter the Discord Log Channel ID",
            default=args.discord_log_channel_id,
        ),
        inquirer.List(
            "DISCORD_BLOCK_OWNER_MENTION",
            message="Block Owner Mention",
            choices=["true", "false"],
            default=args.discord_block_owner_mention,
        ),
        inquirer.Text(
            "DISCORD_SERVER_OWNER_ID",
            message="Enter the Discord Server Owner ID",
            default=args.discord_server_owner_id,
        ),
        inquirer.Text(
            "GAMESERVER_MAX_DURATION",
            message="Enter the Game Server Max Duration (in ms)",
            default=args.gameserver_max_duration,
        ),
        inquirer.Text(
            "GAMESERVER_MIN_REQUIRED_PLAYERS",
            message="Enter the Game Server Min Required Players",
            default=args.gameserver_min_required_players,
        ),
        inquirer.Text(
            "GAMESERVER_MIN_REQUIRED_PLAYERS_WARNING_COUNT",
            message="Enter the Game Server Min Required Players Warning Count",
            default=args.gameserver_min_required_players_warning_count,
        ),
        inquirer.Text(
            "GAMESERVER_MIN_REQUIRED_PLAYERS_WARNING_DURATION",
            message="Enter the Game Server Min Required Players Warning Duration (in ms)",
            default=args.gameserver_min_required_players_warning_duration,
        ),
        inquirer.Text(
            "GAMESERVER_VERSION",
            message="Enter the Game Server Version",
            default=args.gameserver_version,
        ),
        inquirer.Text(
            "AWS_REGION", message="Enter the AWS Region", default=args.aws_region
        ),
        inquirer.Text(
            "AWS_ACCESS_KEY_ID",
            message="Enter the AWS Access Key ID",
            default=args.aws_access_key_id,
        ),
        inquirer.Text(
            "AWS_SECRET_ACCESS_KEY_ID",
            message="Enter the AWS Secret Access Key ID",
            default=args.aws_secret_access_key_id,
        ),
        inquirer.Text(
            "AWS_DYNAMODB_TABLE_NAME",
            message="Enter the AWS DynamoDB Table Name",
            default="mineralcontest_tasks",
        ),
        inquirer.Text(
            "AWS_ECS_CLUSTER_NAME",
            message="Enter the AWS ECS Cluster Name",
            default=args.aws_ecs_cluster_name,
        ),
        inquirer.Text(
            "DOCKER_IMAGE_NAME",
            message="Enter the Docker Image Name",
            default=args.docker_image_name,
        ),
    ]

    # Collect answers interactively
    answers = inquirer.prompt(questions)

    # Define the output file name
    output_file = "../bot/.env"

    # Write the data to the file
    with open(output_file, "w") as file:
        for key, value in answers.items():
            file.write(f'{key}="{value}"\n')

    print(f"Configuration file '{output_file}' has been generated successfully.")


if __name__ == "__main__":
    # Set up argument parsing
    parser = argparse.ArgumentParser(description="Generate a .env configuration file.")
    parser.add_argument("--discord_token", type=str, help="Specify the Discord Token")
    parser.add_argument(
        "--discord_client_id", type=str, help="Specify the Discord Client ID"
    )
    parser.add_argument(
        "--discord_guild_id", type=str, help="Specify the Discord Guild ID"
    )
    parser.add_argument(
        "--discord_admin_role_id", type=str, help="Specify the Discord Admin Role ID"
    )
    parser.add_argument(
        "--discord_user_role_id", type=str, help="Specify the Discord User Role ID"
    )
    parser.add_argument(
        "--discord_gameserver_category_id",
        type=str,
        help="Specify the Discord Game Server Category ID",
    )
    parser.add_argument(
        "--discord_log_channel_id", type=str, help="Specify the Discord Log Channel ID"
    )
    parser.add_argument(
        "--discord_block_owner_mention",
        type=str,
        choices=["true", "false"],
        help="Block Owner Mention (true/false)",
    )
    parser.add_argument(
        "--discord_server_owner_id",
        type=str,
        help="Specify the Discord Server Owner ID",
    )
    parser.add_argument(
        "--gameserver_max_duration",
        type=str,
        default="3000000",
        help="Specify the Game Server Max Duration (in ms)",
    )
    parser.add_argument(
        "--gameserver_min_required_players",
        type=str,
        default="4",
        help="Specify the Game Server Min Required Players",
    )
    parser.add_argument(
        "--gameserver_min_required_players_warning_count",
        type=str,
        default="3",
        help="Specify the Game Server Min Required Players Warning Count",
    )
    parser.add_argument(
        "--gameserver_min_required_players_warning_duration",
        type=str,
        default="90000",
        help="Specify the Game Server Min Required Players Warning Duration (in ms)",
    )
    parser.add_argument(
        "--gameserver_version", type=str, help="Specify the Game Server Version", default="1.19.4",
    )
    parser.add_argument("--aws_region", type=str, help="Specify the AWS Region")
    parser.add_argument(
        "--aws_access_key_id", type=str, help="Specify the AWS Access Key ID"
    )
    parser.add_argument(
        "--aws_secret_access_key_id",
        type=str,
        help="Specify the AWS Secret Access Key ID",
    )

    parser.add_argument(
        "--aws_ecs_cluster_name", type=str, help="Specify the AWS ECS Cluster Name"
    )
    parser.add_argument(
        "--docker_image_name", type=str, help="Specify the Docker Image Name"
    )

    # Parse arguments
    args = parser.parse_args()

    print("##################################################")
    print("BOT Configuration helper.")
    print("##################################################")

    # Generate the configuration file
    generate_config_file(args)
