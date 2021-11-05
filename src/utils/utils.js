const { v4: uuid } = require("uuid");
const ethers = require("ethers");

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
    let params = endpoint.params.map(param => {
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

// Pre-alpha
function makeConfigPrealpha(state) {
  const { title, endpoints, server, hasAuth, auth, version, extraAuth } = state;

  let config = {
    id: uuid(),
    nodeSettings: {
      nodeVersion: "0.1.0",
      cloudProvider: "aws",
      region: "us-east-1",
      stage: "Staging",
      logFormat: "json",
      chains: [
        {
          id: "4",
          type: "evm",
          providers: [
            {
              name: "rinkeby1",
              url: state.RPCs[0],
            },
          ],
          contracts: {
            Airnode: "0xF9C39ec11055508BddA0Bc2a0234aBbbC09a3DeC",
            Convenience: "0xC9fb36DfAE95AD52E32ad48CCe9A1A169EfFaC6E",
          },
          providerAdminForRecordCreation:
            "0xC22376E2Dd4537D78F088B349Cbf2b9Ce79Fe016",
        },
      ],
    },
    triggers: {
      request: [],
    },
    ois: [],
  };
  if (state.RPCs[1])
    config.nodeSettings.chains.push({
      id: "4",
      type: "evm",
      providers: [
        {
          name: "rinkeby2",
          url: state.RPCs[1],
        },
      ],
      contracts: {
        Airnode: "0xF9C39ec11055508BddA0Bc2a0234aBbbC09a3DeC",
        Convenience: "0xC9fb36DfAE95AD52E32ad48CCe9A1A169EfFaC6E",
      },
      providerAdminForRecordCreation:
        "0xC22376E2Dd4537D78F088B349Cbf2b9Ce79Fe016",
    });

  config.triggers.request = endpoints.map(endpoint => {
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
    config.ois[0].apiSpecifications.security[
      `${title}_${auth.name || auth.scheme}`
    ] = [];
    config.ois[0].apiSpecifications.components.securitySchemes[
      `${title}_${auth.name || auth.scheme}`
    ] = {
      type: auth.type,
      in: auth.in,
    };
    if (auth.type == "http") {
      config.ois[0].apiSpecifications.components.securitySchemes[
        `${title}_${auth.name || auth.scheme}`
      ].scheme = auth.scheme;
    } else {
      config.ois[0].apiSpecifications.components.securitySchemes[
        `${title}_${auth.name || auth.scheme}`
      ].name = auth.name;
    }
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
      parameters: endpoint.params.map(param => {
        return {
          name: param.name.replace(/ /g, ""),
          in: param.in,
        };
      }),
    };
  }
  config.ois[0].endpoints = endpoints.map(endpoint => {
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
        {
          name: "_relay_metadata",
          default: "v1",
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
  config.triggers.request = config.triggers.request.filter(
    (item, index, self) => self.indexOf(item) === index
  );

  return JSON.stringify(config, null, 2);
}

// V0.2
function makeConfig(state) {
  const { title, endpoints, server, hasAuth, auth, version, extraAuth } = state;

  let config = {
    chains: [
      {
        authorizers: [],
        contracts: {
          AirnodeRrp: "0xF9C39ec11055508BddA0Bc2a0234aBbbC09a3DeC",
        },
        id: "4",
        providers: {
          rinkeby1: {
            url: "${CHAIN_PROVIDER_URL}",
          },
        },

        type: "evm",
      },
    ],
    httpGateway: {
      enabled: "${HTTP_GATEWAY_ENABLED}",
      apiKey: "${HTTP_GATEWAY_API_KEY}", // In secrets.env
    },
    nodeSettings: {
      cloudProvider: "aws",
      airnodeWalletMnemonic: "${MNEMONIC}",
      logFormat: "json",
      nodeVersion: "0.2.2",
      region: "us-east-1",
      stage: "Staging",
    },
    triggers: {
      rrp: [],
    },
    ois: [],
    apiCredentials: [],
  };
  if (state.RPCs[1])
    config.chains.push({
      authorizers: [],
      contracts: {
        AirnodeRrp: "0xF9C39ec11055508BddA0Bc2a0234aBbbC09a3DeC",
      },
      id: "4",
      providers: {
        rinkeby2: {
          url: "${CHAIN_PROVIDER_URL2}",
        },
      },

      type: "evm",
    });

  config.triggers.rrp = endpoints.map(endpoint => {
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
    config.apiCredentials.push({
      oisTitle: title,
      securitySchemeName: schemeTitle,
      securitySchemeValue: "${" + (auth.name || auth.scheme) + "}",
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
      parameters: endpoint.params.map(param => {
        return {
          name: param.name.replace(/ /g, ""),
          in: param.in,
        };
      }),
    };
  }
  config.ois[0].endpoints = endpoints.map(endpoint => {
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
        {
          name: "_relay_metadata",
          default: "v1",
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
    RPCs: [],
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

  state.RPCs[0] = config.nodeSettings.chains[0].providers[0].url;
  if (config.nodeSettings.chains[1]) {
    state.RPCs[1] = config.nodeSettings.chains[1].providers[0].url;
    state.extraRPC = true;
  }
  return state;
}

// Download Zip
async function makeZip(state) {
  const downloadOptions = state.downloadOptions;
  const JSZip = require("jszip");
  const FileSaver = require("file-saver");
  let zip = new JSZip();
  const config = JSON.parse(state.exportStr);
  if (downloadOptions.includes("Deployment")) {
    //   Add Deployment Package
    await new Promise(resolve => {
      let configZip = new JSZip();

      configZip.file("config.json", state.exportStr);

      // Add Security.json
      let security = {
        apiCredentials: {
          [state.title]: [],
        },
        id: config.id,
      };
      const securitySchemes = Object.keys(
        config.ois[0].apiSpecifications.components.securitySchemes
      );
      if (securitySchemes.length > 0) {
        security.apiCredentials[state.title][0] = {
          securitySchemeName: securitySchemes[0],
          value: state.auth.value ? state.auth.value : "INSERT_API_KEY",
        };
      }
      if (securitySchemes.length > 1) {
        console.log(state.extraAuth);
        security.apiCredentials[state.title][1] = {
          securitySchemeName: securitySchemes[1],
          value: state.extraAuth.value
            ? state.extraAuth.value
            : "INSERT_API_KEY",
        };
      }

      configZip.file("security.json", JSON.stringify(security, null, 2));

      configZip.file(".env", `AWS_ACCESS_KEY_ID=\nAWS_SECRET_KEY=`);
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

function makeReadme(config) {
  // Create Markup Endpoints
  let endpoints = config.triggers.request.map(endpoint => {
    let endpoints = config.ois[0].endpoints;
    let correctParams = endpoints.find(e => e.name == endpoint.endpointName);
    if (!correctParams) return endpoint.endpointName;
    return {
      endpointName: endpoint.endpointName,
      endpointId: endpoint.endpointId,
      parameters: correctParams.parameters.map(p => p.name),
      fixedParams: correctParams.fixedOperationParameters.map(p => {
        return {
          name: p.operationParameter.name,
          value: p.value,
        };
      }),
    };
  });
  // Create Markup String

  let configStr = `# How to use ${config.ois[0].title} on Web3

> [Airnode](https://api3.org/airnode) API Documentation

{{ Give an overview of the API. Describe what it does. }}

**Home Page:** {{ URL to API home page }}  
**Web2 Docs:** {{ URL to API documentation }}

## Call this Airnode API

Read the [Airnode developer documentation](https://docs.api3.org/d/call-an-airnode) to learn how to call Airnode APIs. You'll need the **Provider ID** to call any endpoint in this API.

**Provider ID:**  "{ ************ }

**Provider XPub:** "{ ************ }"

[Reserved Parameters](https://docs.api3.org/r/reserved-parameters) are used to control Airnode behavior and are available for all endpoints.

## Available on Networks:

> Find more information on each chain [Here](https://ethereum.org/en/developers/docs/networks/).

| Chain                                | Airnode RRP Contract                       |
| ------------------------------------ | ------------------------------------------ |\n`;
  let chains = [];
  for (let chain of config.nodeSettings.chains) {
    if (chains.includes(chain.id)) continue;
    let { name } = ethers.providers.getNetwork(Number(chain.id));
    // capitalize the first letter of name
    name = name.charAt(0).toUpperCase() + name.slice(1);
    const address = chain.contracts.Airnode;
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

  endpoints.forEach(endpoint => {
    configStr += `\n## ${endpoint.endpointName} <a name="${endpoint.endpointId}"></a>

{{ Describe the endpoint. Explain what it does and, if possible, deep link to the Web2 documentation. }}

**Web2 Docs:** {{ URL to endpoint documentation }}

You'll need the **Endpoint ID** to call this endpoint.

**Endpoint ID:** ${endpoint.endpointId}

[Request Parameters](https://docs.api3.org/pre-alpha/protocols/request-response/request.html#request-parameters)`;
    let endpointStrs = endpoint.parameters.map(
      e => `${e}\t\t// Parameter Description...`
    );
    if (endpointStrs.length) {
      configStr += "\n\n```solidity\n" + endpointStrs.join("\n") + "\n```";
    } else configStr += "\n\n```solidity\nNone\n```";

    if (endpoint.fixedParams.length) {
      let fixedParamStrs = endpoint.parameters.map(
        e =>
          `${e.name} = '${e.value}';\t\t// The ${e.name} parameter is fixed to ${e.value}`
      );
      configStr +=
        "[Fixed Parameters](https://docs.api3.org/pre-alpha/airnode/specifications/ois.html#_5-3-fixedoperationparameters)\n\n```solidity\n" +
        fixedParamStrs.join("\n") +
        "\n```";
    }
    configStr +=
      "\n\n[Response](https://docs.api3.org/pre-alpha/airnode/specifications/reserved-parameters.html#path)\n\n```json\n{ Add example response json here }\n```\n----";
  });
  // console.log(configStr);
  return configStr;
}

module.exports = {
  makeOAS,
  parseOAS,
  makeConfig,
  makeConfigPrealpha,
  parseConfig,
  makeZip,
  makeReadme,
};
