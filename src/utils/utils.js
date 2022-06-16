// const { v4: uuid } = require("uuid");
const ethers = require("ethers");
const axios = require("axios");
// const apiUrl = "http://localhost:3000";
const apiUrl = "https://clb5462t8j.execute-api.us-east-1.amazonaws.com/latest";
const airnodeProtocol = require("@api3/airnode-protocol");

function makeOAS(state) {
  const { title, version, server, hasAuth, auth, endpoints } = state;
  console.log({ title, version, server, hasAuth, auth, endpoints });
  let oas = {
    openapi: "3.0.1",
    info: {
      title,
    },
    servers: [{ url: server }],
    paths: {},
  };
  if (version) oas.info.version = version;
  for (let endpoint of endpoints) {
    let params = endpoint.params.map((param) => {
      return {
        name: param.name,
        in: param.in,
        required: false,
        style: "form",
        explode: true,
        schema: {
          type: "string",
        },
      };
    });

    let path = {
      [endpoint.path]: {
        [endpoint.method]: {
          description: "API Endpoint",
          parameters: params,
          responses: {
            200: {
              description: "Auto generated using Swagger Maker",
              content: {
                "application/json;charset=utf-8": {
                  schema: {
                    type: "string",
                  },
                  examples: {},
                },
              },
            },
          },
        },
      },
    };

    oas.paths[endpoint.path] = path[endpoint.path];
  }

  if (hasAuth) {
    oas.components = {
      securitySchemes: {
        [`${title}_${auth.name || auth.scheme}`]: {
          type: auth.type,
          name: auth.name,
          in: auth.in,
        },
      },
    };
    if (auth.scheme) {
      oas.components.securitySchemes[
        `${title}_${auth.name || auth.scheme}`
      ].scheme = auth.scheme;
    }
  }
  if (state.addedExtraAuth) {
    let { extraAuth } = state;
    oas.components.securitySchemes[
      `${title}_${extraAuth.name || extraAuth.scheme}`
    ] = {
      type: extraAuth.type,
      name: extraAuth.name,
      in: extraAuth.in,
    };
    if (auth.scheme) {
      oas.components.securitySchemes[
        `${title}_${extraAuth.name || extraAuth.scheme}`
      ].scheme = extraAuth.scheme;
    }
  }
  console.log({ oas });
  return JSON.stringify(oas, null, 2);
}

// parse oas to state variables
async function parseOAS(oas) {
  let state = {
    title: oas.info.title,
    version: oas.info.version,
    server: oas.servers[0].url,
  };
  if (oas.components && oas.components.securitySchemes) {
    const securitySchemes = Object.keys(oas.components.securitySchemes);
    if (securitySchemes.length > 0) {
      state.hasAuth = true;
      state.auth = {
        type: oas.components.securitySchemes[securitySchemes[0]].type,
        in: oas.components.securitySchemes[securitySchemes[0]].in,
        name: oas.components.securitySchemes[securitySchemes[0]].name,
        scheme: oas.components.securitySchemes[securitySchemes[0]].scheme || "",
      };
    }
    if (securitySchemes[1]) {
      state.extraAuth = {
        type: oas.components.securitySchemes[securitySchemes[0]].type,
        in: oas.components.securitySchemes[securitySchemes[0]].in,
        name: oas.components.securitySchemes[securitySchemes[0]].name,
        scheme: oas.components.securitySchemes[securitySchemes[0]].scheme || "",
      };
    }
  } else state.hasAuth = false;

  const paths = Object.keys(oas.paths);
  console.log({ paths });
  state.endpoints = [];
  for (let path of paths) {
    const methods = Object.keys(oas.paths[path]);
    for (let method of methods) {
      if (!["get", "post"].includes(method)) continue;
      let ep = {
        path,
        method,
        params: [],
      };
      if (oas.paths[path][method].parameters) {
        for (let param of oas.paths[path][method].parameters) {
          ep.params.push({
            name: param.name,
            in: param.in == "body" ? "query" : param.in,
          });
        }
      }
      if (oas.paths[path][method].requestBody) {
        try {
          const requestBody = oas.paths[path][method].requestBody;
          const contentTypes = Object.keys(requestBody.content);
          for (let contentType of contentTypes) {
            const bodyParams = Object.keys(
              requestBody.content[contentType].schema.properties
            );

            for (let bodyParam of bodyParams) {
              ep.params.push({
                name: bodyParam,
                in: "query",
              });
            }
          }
        } catch (error) {
          console.log("Error parsing request body", error);
        }
      }

      state.endpoints.push(ep);
    }
  }
  return state;
}

function makeConfig(state) {
  const {
    title,
    endpoints,
    server,
    hasAuth,
    auth,
    version,
    extraAuth,
    exportSettings,
  } = state;

  let config = {
    chains: [],

    nodeSettings: {
      cloudProvider: {
        type: exportSettings.cloudProvider,
        disableConcurrencyReservations: true,
      },
      airnodeWalletMnemonic: "${MNEMONIC}",
      logFormat: "plain",
      logLevel: "INFO",
      nodeVersion: "0.6.5",
      stage: exportSettings.stage,
      heartbeat: {
        enabled: false,
      },
      httpGateway: {
        enabled: true,
        apiKey: "${HTTP_GATEWAY_API_KEY}", // In secrets.env
        maxConcurrency: 20,
      },
      httpSignedDataGateway: {
        enabled: false,
      },
    },
    triggers: {
      rrp: [],
      httpSignedData: [],
    },
    ois: [],
    apiCredentials: [],
  };
  if (exportSettings.cloudProvider === "aws") {
    config.nodeSettings.cloudProvider.region = "us-east-1";
  }

  console.log({ chains: state.selectedChains });
  for (let chainId of state.selectedChains) {
    let chainObj = {
      authorizers: exportSettings.authorizers
        ? [airnodeProtocol.RequesterAuthorizerWithAirnodeAddresses[chainId]]
        : [],
      contracts: {
        AirnodeRrp: airnodeProtocol.AirnodeRrpAddresses[chainId],
      },
      id: chainId,
      // providers: {
      //   [chain.name]: {
      //     url: "${" + chain.name + "_RPC}",
      //   },
      // },
      options: {
        txType: "eip1559",
        priorityFee: {
          value: 3.12,
          unit: "gwei",
        },
        baseFeeMultiplier: 2,
        fulfillmentGasLimit: 500000,
      },
      maxConcurrency: 100,
      blockHistoryLimit: 300,
      minConfirmations: 0,
      type: "evm",
    };
    if (Number(chainId) == 80001) {
      chainObj.providers = {
        Mumbai_1: {
          url: "${Mumbai_1_RPC}",
        },
        Mumbai_2: {
          url: "${Mumbai_2_RPC}",
        },
        Mumbai_3: {
          url: "${Mumbai_3_RPC}",
        },
      };
    } else {
      chainObj.providers = {
        [ethers.providers.getNetwork(Number(chainId)).name]: {
          url:
            "${" + ethers.providers.getNetwork(Number(chainId)).name + "_RPC}",
        },
      };
    }
    config.chains.push(chainObj);
  }

  config.triggers.rrp = endpoints.map((endpoint) => {
    endpoint.path = endpoint.path.replace(/ /g, "");
    endpoint.name = `${endpoint.method.toUpperCase()} ${endpoint.path}`;
    const endpointId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["string", "string"],
        [title, endpoint.name]
      )
    );
    return {
      endpointId,
      endpointName: endpoint.name,
      oisTitle: title,
    };
  });

  config.triggers.http = config.triggers.rrp;

  config.ois[0] = {
    oisFormat: "1.0.0",
    title,
    version,
    apiSpecifications: {
      servers: [
        {
          url: server,
        },
      ],
      security: {},
      components: {
        securitySchemes: {},
      },
      paths: {},
    },
  };

  // Replace whitespaces with underscores in title
  const validTitle = title.replace(/ /g, "_");

  if (hasAuth) {
    let schemeTitle = `${
      auth.type == "http" ? auth.scheme.toUpperCase() : auth.name
    }`;
    config.ois[0].apiSpecifications.security[schemeTitle] = [];

    let { securitySchemes } = config.ois[0].apiSpecifications.components;

    if (auth.type == "http") {
      securitySchemes[schemeTitle] = {
        type: "http",
        scheme: auth.scheme,
      };
    } else {
      securitySchemes[schemeTitle] = {
        type: auth.type,
        in: auth.in,
        name: auth.name,
      };
    }
    // Replace dashes with underscores in auth.name
    const underScoreAuthName = auth.name ? auth.name.replace(/-/g, "_") : null;
    config.apiCredentials.push({
      oisTitle: title,
      securitySchemeName: schemeTitle,
      securitySchemeValue:
        "${" + validTitle + "_" + (auth.scheme || underScoreAuthName) + "}",
    });
  }

  if (state.addedExtraAuth) {
    let schemeTitle = `${
      extraAuth.type == "http" ? extraAuth.scheme.toUpperCase() : extraAuth.name
    }`;
    config.ois[0].apiSpecifications.security[schemeTitle] = [];

    let { securitySchemes } = config.ois[0].apiSpecifications.components;

    if (extraAuth.type == "http") {
      securitySchemes[schemeTitle] = {
        type: "http",
        scheme: extraAuth.scheme,
      };
    } else {
      securitySchemes[schemeTitle] = {
        type: extraAuth.type,
        in: extraAuth.in,
        name: extraAuth.name,
      };
    }

    // Replace dashes with underscores in auth.name
    const underScoreAuthName = extraAuth.name
      ? extraAuth.name.replace(/-/g, "_")
      : null;
    config.apiCredentials.push({
      oisTitle: title,
      securitySchemeName: schemeTitle,
      securitySchemeValue:
        "${" +
        validTitle +
        "_" +
        (extraAuth.scheme || underScoreAuthName) +
        "}",
    });
  }

  // Add default Relay Metadata Security Schemes
  let {
    security,
    components: { securitySchemes },
  } = config.ois[0].apiSpecifications;

  security.relayChainId = [];
  security.relaySponsor = [];
  security.relayRequester = [];

  securitySchemes.relayChainId = {
    in: "header",
    type: "relayChainId",
    name: "chainId",
  };

  securitySchemes.relaySponsor = {
    in: "header",
    type: "relaySponsorAddress",
    name: "sponsorAddress",
  };

  securitySchemes.relayRequester = {
    in: "header",
    type: "relayRequesterAddress",
    name: "requesterAddress",
  };

  for (let endpoint of endpoints) {
    if (!config.ois[0].apiSpecifications.paths[endpoint.path]) {
      config.ois[0].apiSpecifications.paths[endpoint.path] = {};
    }
    config.ois[0].apiSpecifications.paths[endpoint.path][endpoint.method] = {
      parameters: endpoint.params.map((param) => {
        return {
          name: param.name.replace(/ /g, ""),
          in: param.in,
        };
      }),
    };
  }
  config.ois[0].endpoints = endpoints.map((endpoint) => {
    let ep = {
      name: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
      operation: {
        method: endpoint.method,
        path: endpoint.path,
      },
      reservedParameters: [
        {
          name: "_type",
        },
        {
          name: "_path",
        },
        {
          name: "_times",
        },
      ],
      fixedOperationParameters: [],
      parameters: [],
    };
    for (let param of endpoint.params) {
      if (param.fixed) {
        ep.fixedOperationParameters.push({
          operationParameter: {
            name: param.name,
            in: param.in,
          },
          value: param.value,
        });
      } else {
        ep.parameters.push({
          name: param.name,
          operationParameter: {
            name: param.name,
            in: param.in,
          },
        });
      }
    }
    return ep;
  });

  //   remove duplicate endpointId from config.triggers.request
  config.triggers.rrp = config.triggers.rrp.filter(
    (item, index, self) => self.indexOf(item) === index
  );

  return JSON.stringify(config, null, 2);
}

// parse config to state variables
function parseConfig(config) {
  console.log({ config });

  const ois = config.ois[0];
  let state = {
    title: ois.title,
    version: ois.version,
    server: ois.apiSpecifications.servers[0].url,
    // RPCs: [],
  };

  // Delete default Relay Metadata Security Schemes
  // delete ois.apiSpecifications.components.securitySchemes.relayChainId;
  // delete ois.apiSpecifications.components.securitySchemes.relayRequester;
  // delete ois.apiSpecifications.components.securitySchemes.relaySponsor;
  const { relayChainId, relayRequester, relaySponsor, ...otherSchemes } =
    ois.apiSpecifications.components.securitySchemes;

  console.log({ relayChainId, relayRequester, relaySponsor });

  const securitySchemes = Object.keys(otherSchemes);
  console.log({ securitySchemes });

  if (securitySchemes.length > 0) {
    state.hasAuth = true;
    const secScheme =
      ois.apiSpecifications.components.securitySchemes[securitySchemes[0]];

    state.auth = {
      type: secScheme.type,
      in: secScheme.in,
      name: secScheme.name,
    };
    if (secScheme.scheme) state.auth.scheme = secScheme.scheme;
    if (securitySchemes.length > 1) {
      state.addedExtraAuth = true;
      const secScheme =
        ois.apiSpecifications.components.securitySchemes[securitySchemes[1]];

      state.extraAuth = {
        type: secScheme.type,
        in: secScheme.in,
        name: secScheme.name,
      };
      if (secScheme.scheme) state.extraAuth.scheme = secScheme.scheme;
    }
  } else state.hasAuth = false;

  state.endpoints = [];
  for (let endpoint of ois.endpoints) {
    let ep = {
      path: endpoint.operation.path,
      name: endpoint.name == endpoint.operation.path ? "" : endpoint.name,
      method: endpoint.operation.method,
      params: [],
    };
    for (let param of endpoint.parameters) {
      ep.params.push({
        name: param.name,
        in: param.operationParameter.in,
        fixed: false,
        value: "",
      });
    }
    for (let param of endpoint.fixedOperationParameters) {
      ep.params.push({
        name: param.operationParameter.name,
        in: param.operationParameter.in,
        fixed: true,
        value: param.value,
      });
    }
    state.endpoints.push(ep);
  }

  // If pre-alpha parse RPC
  if (config.nodeSettings.chains) {
    state.selectedChains = config.nodeSettings.chains.map(
      (chain) => `${chain.id}`
    );
  } else if (config.chains) {
    state.selectedChains = config.chains.map((chain) => chain.id);
  }
  return state;
}

function makeSecretsEnv(state) {
  // Make secrets.env
  // Find all occurrences of ${} in state.exportStr
  let secrets = [];
  let regex = /\$\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(state.exportStr)) !== null) {
    if (!match[1].includes("RPC")) secrets.push(match[1]);
  }

  let secretsEnv = "";
  const underScoreAuthName = state.auth.name
    ? state.auth.name.replace(/-/g, "_")
    : null;

  // Replace whitespaces with underscores in title
  const validTitle = state.title.replace(/ /g, "_");
  secrets.forEach((variable) => {
    console.log({ variable });
    switch (variable) {
      case "HTTP_GATEWAY_API_KEY":
        secretsEnv += `\n${variable}="${state.gatewayKey}"\n\n`;
        break;
      case `${validTitle}_${state.auth.scheme || underScoreAuthName}`:
        secretsEnv += `${validTitle}_${
          state.auth.scheme || underScoreAuthName
        }="${state.auth.value || ""}"\n`;
        break;
      default:
        secretsEnv += `${variable}=""\n`;
        break;
    }
  });

  for (let chainId of state.selectedChains) {
    if (Number(chainId) == 80001) {
      secretsEnv += `\nMumbai_1_RPC="https://rpc-mumbai.matic.today"`;
      secretsEnv += `\nMumbai_2_RPC="https://matic-mumbai.chainstacklabs.com"`;
      secretsEnv += `\nMumbai_3_RPC="https://rpc-mumbai.maticvigil.com"`;
    } else
      secretsEnv += `\n${
        ethers.providers.getNetwork(Number(chainId)).name
      }_RPC=""`;
    // if (chain.extraRPCs) {
    //   chain.extraRPCs.forEach((rpc, i) => {
    //     secretsEnv += `\n${chain.name}${i + 2}_RPC="${rpc}"`;
    //   });
    // }
  }
  console.log({ secretsEnv });
  return secretsEnv;
}

// Download Zip
async function makeZip(state) {
  console.log(state.RPCs);
  const downloadOptions = state.downloadOptions;
  const JSZip = require("jszip");
  const FileSaver = require("file-saver");
  let zip = new JSZip();
  const config = JSON.parse(state.exportStr);
  const receipt = await getReceipt(config.ois[0].title);

  if (downloadOptions.includes("Deployment")) {
    //   Add Deployment Package
    await new Promise((resolve) => {
      let configZip = new JSZip();

      // Make a config folder
      configZip.folder("config");
      configZip.file("config/config.json", state.exportStr);

      // Make an output folder
      configZip.folder("output");
      configZip.file("output/receipt.json", JSON.stringify({}));

      console.log({ state });
      const secretsEnv = makeSecretsEnv(state);
      configZip.file("config/secrets.env", secretsEnv);
      configZip.file("aws.env", `AWS_ACCESS_KEY_ID=\nAWS_SECRET_ACCESS_KEY=`);
      configZip.generateAsync({ type: "blob" }).then(function (content) {
        console.log("Generated");
        zip.file(`${state.title}-Deployment.zip`, content);
        resolve();
      });
    });
  }
  if (downloadOptions.includes("Readme")) {
    const readme = makeReadme(config);
    zip.file(`${state.title}-Endpoints.md`, readme);
  }
  if (downloadOptions.includes("Testing") && receipt.api) {
    const { endpointId } = config.triggers.http[0];
    const url = `${receipt.api.httpGatewayUrl}/${endpointId}`;
    const gatewayKey = state.gatewayKey;

    const body = {
      parameters: {
        _path: "path.to.value",
        _type: "string",
      },
    };
    const param = config.ois[0].endpoints[0].parameters[0];
    if (param) body.parameters[param.name] = "paramValue";

    const curlCommand = `curl -X POST -H 'Content-Type: application/json' \
-H 'x-api-key: ${gatewayKey}' -d '${JSON.stringify(body)}' '${url}'`;
    console.log({ curlCommand });
    const { makeTestingInstructions } = require("./markdowns");
    const testingInstructions = makeTestingInstructions(
      state.title,
      curlCommand
    );
    zip.file(`${state.title}-Testing-Guide.md`, testingInstructions);
  }
  if (downloadOptions.includes("Removal")) {
    await new Promise((resolve) => {
      let removalZip = new JSZip();

      // Make a config folder
      removalZip.file("config.json", JSON.stringify({}));
      removalZip.file("security.json", JSON.stringify({}));
      removalZip.file(".env", `AWS_ACCESS_KEY_ID=\nAWS_SECRET_KEY=`);
      removalZip.file("old-receipt.json", JSON.stringify(receipt));
      // Need to include this extremely long string to make it work. Cant figure out a workaround for
      // using fs.readFileSync in webpack
      const { removalInstructions } = require("./markdowns");
      removalZip.file("Removal-Instructions.md", removalInstructions);

      // Make an output folder
      removalZip.generateAsync({ type: "blob" }).then(function (content) {
        console.log("Generated");
        zip.file(`${state.title}-Removal-Package.zip`, content);
        resolve();
      });
    });
  }
  zip.generateAsync({ type: "blob" }).then(function (content) {
    FileSaver.saveAs(content, `${state.title}-Export.zip`);
  });
}

async function makeReadme(config) {
  // Create Markup Endpoints
  let endpoints = config.triggers.rrp.map((endpoint) => {
    let endpoints = config.ois[0].endpoints;
    let correctParams = endpoints.find((e) => e.name == endpoint.endpointName);
    if (!correctParams) return endpoint.endpointName;
    return {
      endpointName: endpoint.endpointName,
      endpointId: endpoint.endpointId,
      parameters: correctParams.parameters.map((p) => p.name),
      fixedParams: correctParams.fixedOperationParameters.map((p) => {
        return {
          name: p.operationParameter.name,
          value: p.value,
        };
      }),
    };
  });

  const receipt = await getReceipt(config.ois[0].title);

  // Create Markup String

  let configStr = `# ${config.ois[0].title} - Web3 API Docs

> [Airnode](https://docs.api3.org/airnode/v0.5/) API Documentation

{ Give an overview of the API. Describe what it does. }

**Home Page:** { URL to API home page }  
**Web2 Docs:** { URL to API documentation }

## Sponsor your Smart Contract

The Airnode Address and Xpub are used to [derive a Sponsor Wallet](https://docs.api3.org/airnode/v0.5/grp-developers/requesters-sponsors.html#how-to-derive-a-sponsor-wallet).

**AirnodeAddress:** ${
    receipt.airnodeWallet.airnodeAddress || "{ ************ }"
  }

**Airnode XPub:** ${receipt.airnodeWallet.airnodeXpub || "{ ************ }"} 

## Making Airnode Requests

Read the [Airnode developer documentation](https://docs.api3.org/airnode/v0.5/grp-developers/call-an-airnode.html) to learn how to call Airnode APIs. You'll need the **AirnodeAddress** to call any endpoint in this API. 

[Reserved Parameters](https://docs.api3.org/ois/v1.0.0/reserved-parameters.html) are used to control Airnode behavior and are available for all endpoints. The \`_path\` defines the value to be returned on-chain, and the \`_type\` defines the [Solidity type](https://docs.soliditylang.org/en/latest/abi-spec.html#types); both are required.

## Available on Networks:

| Chain                                | Airnode RRP Contract Address                    |
| ------------------------------------ | ------------------------------------------ |\n`;
  let chains = [];
  for (let chain of config.chains) {
    if (chains.includes(chain.id)) continue;
    let { name } = ethers.providers.getNetwork(Number(chain.id));
    // capitalize the first letter of name
    name = name.charAt(0).toUpperCase() + name.slice(1);
    const address = chain.contracts.AirnodeRrp;
    configStr += `| ${name}                                 | ${address}                                 |\n`;
  }
  configStr += `\n> Find more information on each chain [Here](https://ethereum.org/en/developers/docs/networks/).`;

  // const chain = ethers.providers.getNetwork(4);
  // console.log({ chain });

  //   const string = `
  // __URL:__ ${config.ois[0].apiSpecifications.servers[0].url}

  // __ProviderID:__ *****\n\n`;

  let tableOfContents = endpoints.map(
    (e, i) => `${i + 1}. [${e.endpointName}](#${e.endpointId})`
  );
  configStr += `\n# Endpoints\n${tableOfContents.join("\n")}\n---`;

  endpoints.forEach((endpoint) => {
    configStr += `\n## ${endpoint.endpointName} <a name="${endpoint.endpointId}"></a>

{ Describe the endpoint. Explain what it does and, if possible, deep link to the Web2 documentation. }

**Web2 Docs:** { URL to endpoint documentation }

**EndpointId:** ${endpoint.endpointId}`;

    let endpointStrs = endpoint.parameters.map(
      (e) => `|${e}| { Parameter Description... }`
    );
    if (endpointStrs.length) {
      configStr +=
        `\n\n|[Parameters](https://docs.api3.org/airnode/v0.5/reference/specifications/airnode-abi-specifications.html#api3-airnode-abi) | Description |\n|---|---|\n` +
        endpointStrs.join("\n");
    }
    if (endpoint.fixedParams.length) {
      let fixedParamStrs = endpoint.fixedParams.map(
        (e) => `|${e.name}|${e.value}|`
      );
      configStr +=
        "\n\n|[Fixed Parameters](https://docs.api3.org/airnode/v0.3/grp-providers/guides/build-an-airnode/api-integration.html#fixedoperationparameters)|Fixed Value|\n|---|---|\n" +
        fixedParamStrs.join("\n");
    }
    configStr +=
      "\n\n[Response](https://docs.api3.org/ois/v1.0.0/reserved-parameters.html#path)\n\n```json\n{ Add example response json here }\n```\n----";
  });
  return configStr;
}
// const config = require("./RNGconfig.json");
// makeReadme(config);

async function getOISs() {
  try {
    const JSZip = require("jszip");
    const FileSaver = require("file-saver");
    let zip = new JSZip();

    const { data: OISs } = await axios.get(`${apiUrl}/OISs`);
    for (let OIS of OISs) {
      zip.file(`${OIS.title}/ois.json`, JSON.stringify(OIS, null, 2));
    }
    zip.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(content, `Export-${Date.now()}.zip`);
    });
  } catch (error) {
    return error;
  }
}

async function saveConfig(configStr) {
  const config = JSON.parse(configStr);
  const results = await axios.post(`${apiUrl}/configs`, config);
  return results.data;
}

async function getConfigs() {
  const results = await axios.get(`${apiUrl}/configs`);
  return results.data;
}

async function getConfig(title) {
  const results = await axios.get(`${apiUrl}/config/${title}`);
  return results.data;
}

async function getConfigTitles() {
  const results = await axios.get(`${apiUrl}/configs?titles=true`);
  return results.data;
}

async function deleteConfig(title) {
  const results = await axios.delete(`${apiUrl}/config/${title}`);
  return results.data;
}

async function saveReceipt(receipt) {
  const results = await axios.post(`${apiUrl}/receipts`, receipt);
  return results.data;
}

async function getReceipt(title) {
  const results = await axios.get(`${apiUrl}/receipt/${title}`);
  return results.data;
}

// async function getRPC() {
//   const results = await axios.get(`${apiUrl}/RPC`);
//   return results.data;
// }

async function makeGatewayRequest(
  gatewayUrl,
  endpointId,
  parameters,
  gatewayKey
) {
  console.log({ gatewayUrl, endpointId, parameters, gatewayKey });
  const results = await axios.post(`${apiUrl}/gatewayRequest`, {
    gatewayUrl,
    endpointId,
    parameters,
    gatewayKey,
  });
  console.log({ results });
  return results.data;
}

// // Get chain options
// async function getChains(enabled = true) {
//   const results = await axios.get(`${apiUrl}/RPC/chains`);
//   return results.data.chains.map((chain) => {
//     return {
//       ...chain,
//       enabled,
//       url: "",
//       loading: false,
//     };
//   });
// }

// // Create a new RPC URL for the chain
// async function newRPC(chain, RPC) {
//   const results = await axios.post(`${apiUrl}/RPC`, { chain, RPC });
//   return results.data.url;
// }

// // Create a new RPC URL for the chain
// async function saveChain(chain) {
//   const results = await axios.post(`${apiUrl}/RPC/chains`, { ...chain });
//   return results;
// }

// // Delete chain from DB
// async function deleteChain(chain) {
//   const results = await axios.delete(`${apiUrl}/RPC/chains/${chain.name}`);
//   return results;
// }

module.exports = {
  makeOAS,
  parseOAS,
  makeConfig,
  parseConfig,
  makeZip,
  saveConfig,
  saveReceipt,
  getConfigTitles,
  getConfigs,
  getConfig,
  getReceipt,
  getOISs,
  // getRPC,
  deleteConfig,
  makeReadme,
  // getChains,
  // newRPC,
  // saveChain,
  // deleteChain,
  makeGatewayRequest,
  makeSecretsEnv,
  // openEndpoint,
};
