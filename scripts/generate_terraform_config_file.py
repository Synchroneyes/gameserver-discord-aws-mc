import yaml
import inquirer
import argparse


def generate_yaml_file(args):
    # Define the questions with defaults from command-line arguments
    questions = [
        inquirer.Text("region", message="Enter the region", default=args.region),
        inquirer.Text(
            "cluster_name", message="Enter the cluster name", default=args.cluster_name
        ),
    ]

    # Collect answers interactively
    answers = inquirer.prompt(questions)

    # Combine command-line arguments with interactive answers
    config_data = {
        "region": answers.get("region"),
        "cluster_name": answers.get("cluster_name"),
    }

    # Define the output file name
    output_file = "../infrastructure/config.yaml"

    # Write the data to a YAML file
    with open(output_file, "w") as file:
        yaml.dump(config_data, file, default_flow_style=False)

    print(f"YAML file '{output_file}' has been generated successfully.")


if __name__ == "__main__":
    # Set up argument parsing
    parser = argparse.ArgumentParser(description="Generate a YAML configuration file.")
    parser.add_argument("--region", type=str, help="Specify the region")
    parser.add_argument("--cluster_name", type=str, help="Specify the cluster name")

    # Parse arguments
    args = parser.parse_args()

    print("##################################################")
    print("Terraform Configuration helper.")
    print("##################################################")

    # Generate the YAML file
    generate_yaml_file(args)
