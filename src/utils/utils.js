// const { v4: uuid } = require("uuid");
const ethers = require("ethers");
const axios = require("axios");

// const apiUrl = "http://localhost:3000";
const apiUrl = "https://clb5462t8j.execute-api.us-east-1.amazonaws.com/latest";

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
            "200": {
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

// V0.2
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
        // region: "us-east-1",
      },
      airnodeWalletMnemonic: "${MNEMONIC}",
      logFormat: "plain",
      logLevel: "INFO",
      nodeVersion: "0.3.1",
      stage: exportSettings.stage,
      heartbeat: {
        enabled: false,
      },
      httpGateway: {
        enabled: true,
        apiKey: "${HTTP_GATEWAY_API_KEY}", // In secrets.env
      },
    },
    triggers: {
      rrp: [],
    },
    ois: [],
    apiCredentials: [],
  };
  if (exportSettings.cloudProvider === "aws") {
    config.nodeSettings.cloudProvider.region = "us-east-1";
  }
  for (let chain of state.chains) {
    let chainObj = {
      authorizers:
        chain.authorizersAddress && exportSettings.authorizers
          ? [chain.authorizersAddress]
          : [],
      contracts: {
        AirnodeRrp: chain.airnodeAddress,
      },
      id: chain.id,
      providers: {
        [chain.name]: {
          url: "${" + chain.name + "_RPC}",
        },
      },
      type: "evm",
    };
    if (chain.extraRPCs) {
      chain.extraRPCs.forEach((rpc, i) => {
        const count = `${i + 2}`;
        chainObj.providers[chain.name + count] = {
          url: "${" + chain.name + count + "_RPC}",
        };
      });
    }
    config.chains.push(chainObj);
  }

  config.triggers.rrp = endpoints.map((endpoint) => {
    endpoint.path = endpoint.path.replace(/ /g, "");
    endpoint.name = `${endpoint.method.toUpperCase()} ${endpoint.path}`;
    const endpointId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["string"],
        [`${title}/${endpoint.method}-${endpoint.name}`]
      )
    );
    return {
      endpointId,
      endpointName: endpoint.name,
      oisTitle: title,
    };
  });

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

  if (hasAuth) {
    let schemeTitle = `${title}_${auth.name || auth.scheme}`;
    config.ois[0].apiSpecifications.security[schemeTitle] = [];
    config.ois[0].apiSpecifications.components.securitySchemes[schemeTitle] = {
      type: auth.type,
      in: auth.in,
    };
    if (auth.type == "http") {
      config.ois[0].apiSpecifications.components.securitySchemes[
        schemeTitle
      ].scheme = auth.scheme;
    } else {
      config.ois[0].apiSpecifications.components.securitySchemes[
        schemeTitle
      ].name = auth.name;
    }
    // Replace dashes with underscores in auth.name
    const underScoreAuthName = auth.name ? auth.name.replace(/-/g, "_") : null;
    config.apiCredentials.push({
      oisTitle: title,
      securitySchemeName: schemeTitle,
      securitySchemeValue: "${" + (underScoreAuthName || auth.scheme) + "}",
    });
  }

  if (state.addedExtraAuth) {
    config.ois[0].apiSpecifications.security[
      `${title}_${state.extraAuth.name || state.extraAuth.scheme}`
    ] = [];
    config.ois[0].apiSpecifications.components.securitySchemes[
      `${title}_${state.extraAuth.name || state.extraAuth.scheme}`
    ] = {
      type: state.extraAuth.type,
      in: state.extraAuth.in,
    };
    if (extraAuth.type == "http") {
      config.ois[0].apiSpecifications.components.securitySchemes[
        `${title}_${state.extraAuth.name || state.extraAuth.scheme}`
      ].scheme = extraAuth.scheme;
    } else {
      config.ois[0].apiSpecifications.components.securitySchemes[
        `${title}_${state.extraAuth.name || state.extraAuth.scheme}`
      ].name = extraAuth.name;
    }
  }

  for (let endpoint of endpoints) {
    if (!config.ois[0].apiSpecifications.paths[endpoint.path])
      config.ois[0].apiSpecifications.paths[endpoint.path] = {};
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
      testable: true,
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
  const securitySchemes = Object.keys(
    ois.apiSpecifications.components.securitySchemes
  );
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
    state.chains = config.nodeSettings.chains.map((chain) => {
      return {
        id: chain.id,
        name: chain.providers[0].name,
        url: chain.providers[0].url,
        airnodeAddress: chain.contracts.Airnode,
        enabled: true,
        loading: false,
      };
    });
    // If v0.2 and includes secrets
  } else if (config.chains) {
    state.chains = config.chains.map((chain) => {
      const chainName = Object.keys(chain.providers)[0];
      return {
        id: chain.id,
        name: chainName,
        url: "",
        airnodeAddress: chain.contracts.AirnodeRrp,
        enabled: true,
        loading: false,
        authorizersAddress: chain.authorizers[0],
      };
    });
  }
  return state;
}

// Download Zip
async function makeZip(state) {
  console.log(state.RPCs);
  const downloadOptions = state.downloadOptions;
  const JSZip = require("jszip");
  const FileSaver = require("file-saver");
  let zip = new JSZip();
  const config = JSON.parse(state.exportStr);
  if (downloadOptions.includes("Deployment")) {
    //   Add Deployment Package
    await new Promise((resolve) => {
      let configZip = new JSZip();

      // Make a config folder
      configZip.folder("config");
      configZip.file("config/config.json", state.exportStr);

      // Make secrets.env
      // Find all occurrences of ${} in state.exportStr
      let secrets = [];
      let regex = /\$\{([^}]+)\}/g;
      let match;
      while ((match = regex.exec(state.exportStr)) !== null) {
        if (!match[1].includes("RPC")) secrets.push(match[1]);
      }

      console.log(state);
      let secretsEnv = "";
      // let underScoreAuthName;
      secrets.forEach((variable) => {
        switch (variable) {
          case "HTTP_GATEWAY_API_KEY":
            secretsEnv += `\n${variable}="${state.gateWayKey}"\n\n`;
            break;
          case state.auth.name: {
            const underScoreAuthName = variable.replace(/-/g, "_");
            secretsEnv += `${underScoreAuthName}="${state.auth.value || ""}"\n`;
            break;
          }
          default:
            secretsEnv += `${variable}=""\n`;
            break;
        }
      });

      for (let chain of state.chains) {
        if (!chain.enabled) continue;
        secretsEnv += `\n${chain.name}_RPC="${chain.url}"`;
        if (chain.extraRPCs) {
          chain.extraRPCs.forEach((rpc, i) => {
            secretsEnv += `\n${chain.name}${i + 2}_RPC="${rpc}"`;
          });
        }
      }
      console.log({ secretsEnv });
      configZip.file("config/secrets.env", secretsEnv);
      configZip.file("aws.env", `AWS_ACCESS_KEY_ID=\nAWS_SECRET_ACCESS_KEY=`);
      configZip.generateAsync({ type: "blob" }).then(function(content) {
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
  if (downloadOptions.includes("OAS")) {
    const oas = makeOAS(state);
    zip.file(`oas.json`, oas);
  }
  if (downloadOptions.includes("OIS")) {
    const ois = config.ois[0];
    zip.file(`ois.json`, JSON.stringify(ois, null, 2));
  }
  zip.generateAsync({ type: "blob" }).then(function(content) {
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

  let configStr = `# How to use ${config.ois[0].title} on Web3

> [Airnode](https://api3.org/airnode) API Documentation

{{ Give an overview of the API. Describe what it does. }}

**Home Page:** {{ URL to API home page }}  
**Web2 Docs:** {{ URL to API documentation }}

## Call this Airnode API

Read the [Airnode developer documentation](https://docs.api3.org/d/call-an-airnode) to learn how to call Airnode APIs. You'll need the **Provider ID** to call any endpoint in this API.

**AirnodeAddress:** ${receipt.airnodeAddress || "{ ************ }"}

**Airnode XPub:** ${receipt.airnodeXpub || "{ ************ }"} 

[Reserved Parameters](https://docs.api3.org/r/reserved-parameters) are used to control Airnode behavior and are available for all endpoints.

## Available on Networks:

> Find more information on each chain [Here](https://ethereum.org/en/developers/docs/networks/).

| Chain                                | Airnode RRP Contract                       |
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

{{ Describe the endpoint. Explain what it does and, if possible, deep link to the Web2 documentation. }}

**Web2 Docs:** {{ URL to endpoint documentation }}

You'll need the **Endpoint ID** to call this endpoint.

**Endpoint ID:** ${endpoint.endpointId}

[Request Parameters](https://docs.api3.org/airnode/v0.3/grp-developers/call-an-airnode.html#request-parameters)`;
    let endpointStrs = endpoint.parameters.map(
      (e) => `${e}\t\t// Parameter Description...`
    );
    if (endpointStrs.length) {
      configStr += "\n\n```solidity\n" + endpointStrs.join("\n") + "\n```";
    } else configStr += "\n\n```solidity\nNone\n```";

    if (endpoint.fixedParams.length) {
      let fixedParamStrs = endpoint.fixedParams.map(
        (e) =>
          `${e.name} = '${e.value}';\t\t// The ${e.name} parameter is fixed to ${e.value}`
      );
      configStr +=
        "[Fixed Parameters](https://docs.api3.org/airnode/v0.3/grp-providers/guides/build-an-airnode/api-integration.html#fixedoperationparameters)\n\n```solidity\n" +
        fixedParamStrs.join("\n") +
        "\n```";
    }
    configStr +=
      "\n\n[Response](https://docs.api3.org/airnode/v0.3/reference/specifications/reserved-parameters.html#path)\n\n```json\n{ Add example response json here }\n```\n----";
  });
  // console.log(configStr);
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
    zip.generateAsync({ type: "blob" }).then(function(content) {
      FileSaver.saveAs(content, `Export-${Date.now()}.zip`);
    });
  } catch (error) {
    return error;
  }
}

// async function openEndpoint(providerId, endpointId) {
//   const airnode = await evm.getAirnode();
//   await airnodeAdmin.updateAuthorizers(
//     airnode,
//     params.providerId,
//     params.endpointId,
//     [ethers.constants.AddressZero]
//   );
//   console.log(
//     `Updated authorizers of endpoint with ID ${params.endpointId} to allow all public requests`
//   );
// }

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

async function getRPC() {
  const results = await axios.get(`${apiUrl}/RPC`);
  return results.data;
}

// Get chain options
async function getChains(enabled = true) {
  const results = await axios.get(`${apiUrl}/RPC/chains`);
  return results.data.chains.map((chain) => {
    return {
      ...chain,
      enabled,
      url: "",
      loading: false,
    };
  });
}

// Create a new RPC URL for the chain
async function newRPC(chain, RPC) {
  const results = await axios.post(`${apiUrl}/RPC`, { chain, RPC });
  return results.data.url;
}

// Create a new RPC URL for the chain
async function saveChain(chain) {
  const results = await axios.post(`${apiUrl}/RPC/chains`, { ...chain });
  return results;
}

// Delete chain from DB
async function deleteChain(chain) {
  const results = await axios.delete(`${apiUrl}/RPC/chains/${chain.name}`);
  return results;
}

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
  getRPC,
  deleteConfig,
  makeReadme,
  getChains,
  newRPC,
  saveChain,
  deleteChain,
  // openEndpoint,
};
