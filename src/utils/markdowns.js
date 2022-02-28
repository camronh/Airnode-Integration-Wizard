const removalInstructions =
  '## Airnode Removal Instructions (Pre-Alpha)\n\n1. Add AWS Credentials to .env file\n\n2. In a terminal opened to this directory, run:\n\nLinux/Mac:\n```\ndocker run -it --rm --env-file .env --env COMMAND=remove-with-receipt --env RECEIPT_FILENAME="old-receipt.json" -v "$(pwd):/airnode/out" api3/airnode-deployer:pre-alpha\n```\n\nWindows:\n```\ndocker run -it --rm --env-file .env --env COMMAND=remove-with-receipt --env RECEIPT_FILENAME="old-receipt.json" -v "%cd%:/airnode/out" api3/airnode-deployer:pre-alpha\n```\n';

const selfDeploymentInstructions =
  '# Airnode Self Deployment Guide\nThis is a guide on how to deploy your Airnode in just a few steps! Having [Docker](https://docs.docker.com/get-docker/) installed in **required**! \n\n### 1. Insert your [AWS credentials](https://www.youtube.com/watch?v=KngM5bfpttA) into the `aws.env` file.\n> **Admin IAM privileges are required.**\nIf your ```aws.env``` file is hidden you can find out how to reveal it for [Windows](https://support.microsoft.com/en-us/windows/show-hidden-files-0320fe58-0117-fd59-6851-9b7f9840fdb2#:~:text=Select%20the%20Start%20button%2C%20then,drives%2C%20and%20then%20select%20OK.) or [Mac](https://www.macworld.co.uk/how-to/show-hidden-files-mac-3520878/).\n\n```\nAWS_ACCESS_KEY_ID=XXXX\nAWS_SECRET_ACCESS_KEY=XXXXX\n```\n\n\n------\n\n\n### 2. If your API requires them, ensure that your API Credentials are in the ```config/secrets.env``` file.\n```\n...\nx_api_key="21ubf-baskjfg...."\n...\n```\n\n----\n### 3. Add your admin wallet mnemonic phrase to your ```config/secrets.env```. Any wallet that you control will work here.\n\n> You can generate a fresh mnemonic using the follow command:\n   `docker run api3/airnode-admin:0.4.1 generate-mnemonic`\n\n```\nMNEMONIC="mercy faint fatal measure..."\n...\n```\n\n---\n\n### 4. Run the Deployment Command for your OS.\n\n> Make sure your terminal is in the same directory as your deployment files.\n\n| Linux  | Windows |\n| ------------- |:-------------:|\n| `docker run -it --rm --env-file aws.env -e USER_ID=$(id -u) -e GROUP_ID=$(id -g) -v "$(pwd)/config:/app/config" -v "$(pwd)/output:/app/output" api3/airnode-deployer:0.4.1 deploy`| `docker run -it --rm --env-file aws.env -e USER_ID=$(id -u) -e GROUP_ID=$(id -g) -v "$(pwd)/config:/app/config" -v "$(pwd)/output:/app/output" api3/airnode-deployer:0.4.1 deploy`      |\n\n----\n### 5. Wait for deployment to finish.\n\nThat\'s it, you\'re blockchain compatible! If your Airnode deployed correctly you should see an output/receipt.json file in the working directory. We will need to collect that from you to do testing and create Airnode API docs. Please send the receipt file to Camron@API3.org or Vincent@API3.org.';

function makeTestingInstructions(title, curlCommand) {
  let string = `# ${title} Airnode Testing Guide\n\n> This guide uses the Airnode HTTP Gateway to make test calls. It is advised you don't publish these credentials \nas that would give users access to all of your Endpoints. This guide is for internal testing.\n\n`;
  string += `We have constructed an example curl request template for your Airnode. You will need to adjust some of the values. You can find more info on making an Airnode test request here:

https://docs.api3.org/airnode/v0.4/grp-providers/tutorial/quick-deploy-aws/#execute-endpoint\n\n
`;

  string += "## Example Request:\n\n```sh\n" + curlCommand + "\n```";
  return string;
}

module.exports = {
  removalInstructions,
  selfDeploymentInstructions,
  makeTestingInstructions
};
