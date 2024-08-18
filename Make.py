import os
import subprocess
import sys
import platform
import json
import re

def get_discord_client_id(env_file_path):
    with open(env_file_path, 'r') as file:
        content = file.read()
        match = re.search(r'DISCORD_CLIENT_ID="([^"]+)"', content)
        if match:
            return match.group(1)
        else:
            raise ValueError("DISCORD_CLIENT_ID not found in the .env file")


def run_command(command, shell=True, cwd=None):
    try:
        result = subprocess.run(command, shell=shell, cwd=cwd, check=True, text=True)
        return result.returncode
    except subprocess.CalledProcessError as e:
        print(f"Error occurred: {e}")
        sys.exit(1)

def get_output(command, shell=True):
    try:
        result = subprocess.run(command, shell=shell, check=True, text=True, stdout=subprocess.PIPE)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error occurred: {e}")
        sys.exit(1)

def load_config(file_path):
    config = {}
    with open(file_path, 'r') as file:
        for line in file:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                config[key.strip()] = value.strip().strip('"')
    return config

def configure(config):
    aws_region = config['AWS_REGION']
    stack_name = config['STACK_NAME']
    template_file = config['TEMPLATE_FILE']
    s3_bucket_name = config['S3_BUCKET_NAME']
    dynamodb_table_name = config['DYNAMODB_TABLE_NAME']
    ecr_repository_name = config['ECR_REPOSITORY_NAME']
    ecs_cluster_name = config['ECS_CLUSTER_NAME']
    terraform_folder = config['TERRAFORM_FOLDER']

    run_command(f"aws cloudformation deploy --region {aws_region} --stack-name {stack_name} --template-file {template_file} --capabilities CAPABILITY_NAMED_IAM --parameter-overrides S3BucketName={s3_bucket_name} DynamoDBTableName={dynamodb_table_name} ECRRepositoryName={ecr_repository_name}")
    run_command(f"{python_command} generate_terraform_config_file.py --region={aws_region} --cluster_name={ecs_cluster_name}", cwd="scripts")
    
    ecr_repository_url = get_output(f"aws cloudformation describe-stacks --region {aws_region} --query \"Stacks[?StackName=='{stack_name}'][].Outputs[?OutputKey=='ECRRepositoryURIOutput'].OutputValue\" --output text")
    with open(f"{terraform_folder}/config.yaml", "a") as config_file:
        config_file.write(f"ecr_repository: {ecr_repository_url}\n")
    
    run_command(f"{python_command} generate_bot_config_file.py --aws_ecs_cluster_name=\"{ecs_cluster_name}\" --aws_region=\"{aws_region}\" --docker_image_name=\"{ecr_repository_name}\"", cwd="scripts")
    
    print("Configurations generated successfully")

def init(config):
    run_command(f"{pip_command} install -r requirements.txt", cwd="scripts")
    run_command(f"{python_command} generate_makefile_config.py", cwd="scripts")

def terraform_init(config):
    s3_bucket_name = config['S3_BUCKET_NAME']
    stack_name = config['STACK_NAME']
    aws_region = config['AWS_REGION']
    dynamodb_table_name = config['DYNAMODB_TABLE_NAME']
    terraform_folder = config['TERRAFORM_FOLDER']

    run_command(f"{terraform_command} init -backend-config=\"bucket={s3_bucket_name}\" -backend-config=\"key={stack_name}.tfstate\" -backend-config=\"region={aws_region}\" -backend-config=\"dynamodb_table={dynamodb_table_name}\" -upgrade", cwd=terraform_folder)

def deploy(config):
    terraform_folder = config['TERRAFORM_FOLDER']
    run_command(f"{terraform_command} apply --auto-approve", cwd=terraform_folder)

def destroy(config):
    aws_region = config['AWS_REGION']
    stack_name = config['STACK_NAME']
    terraform_folder = config['TERRAFORM_FOLDER']
    bot_folder = config['BOT_FOLDER']

    run_command(f"{terraform_command} destroy --auto-approve", cwd=terraform_folder)
    run_command(f"aws lambda invoke --region {aws_region} --function-name CleanupFunction output.txt")
    os.remove("output.txt")
    run_command(f"aws cloudformation delete-stack --region {aws_region} --stack-name {stack_name}")
    run_command(f"docker compose down --rmi --volumes", cwd=bot_folder)

def build_gameserver(config):
    aws_region = config['AWS_REGION']
    ecr_repository_name = config['ECR_REPOSITORY_NAME']
    
    aws_account_id_output = get_output("aws sts get-caller-identity --output text")
    aws_account_id = aws_account_id_output.split()[0]
    
    gameserver_folder = config['GAMESERVER_FOLDER']

    run_command(f"aws ecr get-login-password --region {aws_region} | docker login --username AWS --password-stdin {aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com")
    run_command(f"docker build --platform=\"linux/amd64\" -t {ecr_repository_name} .", cwd=gameserver_folder)
    run_command(f"docker tag {ecr_repository_name}:latest {aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/{ecr_repository_name}:latest")
    run_command(f"docker push {aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/{ecr_repository_name}:latest")

def run_discord_bot(config):
    bot_folder = config['BOT_FOLDER']
    run_command(f"docker compose build --no-cache", cwd=bot_folder)
    run_command(f"docker compose up -d", cwd=bot_folder)

def discord_invite_link(config):
    env_file_path = './bot/.env'
    
    # Extract client ID
    client_id = get_discord_client_id(env_file_path)
    
    # Construct the invite link
    invite_link = f"https://discord.com/oauth2/authorize?client_id={client_id}&permissions=8&integration_type=0&scope=applications.commands+bot"
    
    # Print the invite link
    print(f"Click on the following link to add the bot into your Discord Server: {invite_link}")
def install(config):
    terraform_init(config)
    deploy(config)
    build_gameserver(config)
    discord_invite_link(config)

def main():
    tasks = {
        "configure": configure,
        "init": init,
        "terraform_init": terraform_init,
        "deploy": deploy,
        "destroy": destroy,
        "build_gameserver": build_gameserver,
        "run_discord_bot": run_discord_bot,
        "discord_invite_link": discord_invite_link,
        "install": install,
    }

    if len(sys.argv) < 2 or sys.argv[1] not in tasks:
        print(f"Usage: {sys.argv[0]} <task>")
        print("Tasks:")
        for task in tasks:
            print(f"  - {task}")
        sys.exit(1)

    task = sys.argv[1]
    config = load_config("Makefile.config")
    tasks[task](config)

if __name__ == "__main__":
    os_name = platform.system()
    python_command = "python" if os_name == "Windows" else "python3"
    pip_command = "pip" if os_name == "Windows" else "pip3"
    terraform_command = "terraform"
    
    main()
