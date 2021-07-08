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
        key: {
          type: auth.type,
          name: auth.name,
          in: auth.in,
        },
      },
    };
  }
  console.log({ oas });
  return JSON.stringify(oas, null, 2);
}

// parse oas to state variables
function parseOAS(oas) {
  console.log({ oas });
  let state = {
    title: oas.info.title,
    version: oas.info.version,
    server: oas.servers[0].url,
  };
  const securitySchemes = Object.keys(oas.components.securitySchemes);
  if (securitySchemes.length > 0) {
    state.hasAuth = true;
    state.auth = {
      type: oas.components.securitySchemes[securitySchemes[0]].type,
      in: oas.components.securitySchemes[securitySchemes[0]].in,
      name: oas.components.securitySchemes[securitySchemes[0]].name,
    };
  }
  const paths = Object.keys(oas.paths);
  state.endpoints = [];
  for (let path of paths) {
    const methods = Object.keys(oas.paths[path]);
    for (let method of methods) {
      state.endpoints.push({
        path,
        method,
        params: oas.paths[path][method].parameters.map(param => {
          return {
            name: param.name,
            in: param.in,
          };
        }),
      });
    }
  }
  console.log({ state });
  return state;
}

function makeConfig(state) {
  const { title, endpoints, server, hasAuth, auth, version } = state;

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
              name: "rinkeby-alchemy",
              url: state.RPC,
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

  config.triggers.request = endpoints.map(endpoint => {
    const endpointId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["string"],
        [`${title}/${endpoint.path}`]
      )
    );
    return {
      endpointId,
      endpointName: endpoint.path,
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
    config.ois[0].apiSpecifications.security[`${title}Auth`] = [];
    config.ois[0].apiSpecifications.components.securitySchemes[
      `${title}Auth`
    ] = {
      type: auth.type,
      name: auth.name,
      in: auth.in,
    };
  }

  for (let endpoint of endpoints) {
    config.ois[0].apiSpecifications.paths[endpoint.path] = {
      [endpoint.method]: {
        parameters: endpoint.params.map(param => {
          return {
            name: param.name,
            in: param.in,
          };
        }),
      },
    };
  }
  config.ois[0].endpoints = endpoints.map(endpoint => {
    let ep = {
      name: endpoint.path,
      operation: {
        method: endpoint.method,
        path: endpoint.path,
      },
      reservedParameters: [
        {
          name: "_type",
          fixed: endpoint.reservedParam.type,
        },
        {
          name: "_path",
          fixed: endpoint.reservedParam.path,
        },
      ],
      parameters: endpoint.params.map(param => {
        return {
          name: param.name,
          operationParameter: {
            name: param.name,
            in: param.in,
          },
        };
      }),
    };
    if (endpoint.reservedParam.times) {
      ep.reservedParameters.push({
        name: "_times",
        fixed: "100000000000000000",
      });
    }
    return ep;
  });

  //   remove duplicate endpointId from config.triggers.request
  config.triggers.request = config.triggers.request.filter(
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
  };
  const securitySchemes = Object.keys(
    ois.apiSpecifications.components.securitySchemes
  );
  if (securitySchemes.length > 0) {
    state.hasAuth = true;
    state.auth = {
      type: ois.components.securitySchemes[securitySchemes[0]].type,
      in: ois.components.securitySchemes[securitySchemes[0]].in,
      name: ois.components.securitySchemes[securitySchemes[0]].name,
    };
  } else state.hasAuth = false;
  console.log({ state });

  const paths = Object.keys(ois.apiSpecifications.paths);
  state.endpoints = [];
  for (let path of paths) {
    const methods = Object.keys(ois.apiSpecifications.paths[path]);
    for (let method of methods) {
      state.endpoints.push({
        path,
        method,
        params: ois.apiSpecifications.paths[path][method].parameters.map(
          param => {
            return {
              name: param.name,
              in: param.in,
            };
          }
        ),
      });
    }
  }
  state.RPC = config.nodeSettings.chains[0].providers[0].url;
  console.log({ state });
  return state;
}

// Download Zip
async function zipDeploymentPackage(state) {
  const JSZip = require("jszip");
  const FileSaver = require("file-saver");
  let zip = new JSZip();
  zip.file("config.json", state.config);
  const config = JSON.parse(state.config);

  // Add Securty.json
  let security = {
    apiCredentials: {
      [state.title]: [],
    },
    id: config.id,
  };
  console.log({ security });
  const securitySchemes =
    config.ois[0].apiSpecifications.components.securitySchemes;
  for (let scheme in securitySchemes) {
    security.apiCredentials[state.title].push({
      securitySchemeName: scheme,
      value: state.auth.value,
    });
  }

  zip.file("security.json", JSON.stringify(security, null, 2));
  zip.file(".env", `AWS_ACCESS_KEY_ID=\nAWS_SECRET_KEY=`);
  zip.generateAsync({ type: "blob" }).then(function(content) {
    FileSaver.saveAs(content, `${state.title}-Deployment.zip`);
  });
}

module.exports = {
  makeOAS,
  parseOAS,
  makeConfig,
  parseConfig,
  zipDeploymentPackage,
};
