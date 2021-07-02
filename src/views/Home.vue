<template>
  <v-container>
    <v-card>
      <v-form v-model="valid">
        <v-card-title>
          <v-text-field
            placeholder="Title"
            v-model="title"
            :rules="required"
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn @click="exportOAS" :disabled="!valid || !endpoints.length">
            Export
          </v-btn>
        </v-card-title>
        <v-container>
          <v-row align="center" justify="center">
            <v-col cols="12" md="4">
              <v-text-field v-model="version" label="Version"></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="server"
                label="Server"
                :rules="serverRules"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6" md="2">
              <v-checkbox label="Auth" v-model="hasAuth"> </v-checkbox>
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="auth.type"
                :disabled="!hasAuth"
                label="Type"
                :items="['apiKey']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                :disabled="!hasAuth"
                v-model="auth.in"
                label="In"
                :items="['query', 'header']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                :disabled="!hasAuth"
                v-model="auth.name"
                label="Name"
                placeholder="X-API-KEY"
                :rules="hasAuth ? required : false"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-card-title>
            Endpoints
          </v-card-title>
          <v-card-text>
            <v-list v-if="endpoints.length">
              <v-list-item v-for="(endpoint, i) of endpoints" :key="i">
                <v-list-item-content>
                  <v-list-item-title v-text="endpoint.path"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-icon>
                  <v-icon @click="deleteEndpoint(i)" color="red">
                    mdi-minus
                  </v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list>
            <v-card-text v-else disabled>
              Add Endpoints below...
            </v-card-text>
            <br />
            <v-card>
              <v-card-title>
                New Endpoint
              </v-card-title>
              <v-row align="center" justify="center">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="ep.path"
                    label="Path"
                    placeholder="/endpoint/{pathParam}"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-select
                    v-model="ep.method"
                    label="Method"
                    :items="['get', 'post']"
                    required
                  ></v-select>
                </v-col>
              </v-row>
              <v-card-text>
                <h2 class="text-h6 mb-2">
                  Params
                </h2>

                <v-chip-group v-model="ep.params" column multiple>
                  <v-chip
                    outlined
                    v-for="(param, i) of ep.params"
                    :key="param.name"
                    close
                    @click:close="deleteParam(i)"
                  >
                    {{ param.name }} - {{ param.in }}
                  </v-chip>
                </v-chip-group>
              </v-card-text>
              <v-row align="center" justify="center">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="param.name"
                    label="Name"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-select
                    v-model="param.in"
                    label="In"
                    :items="['query', 'header', 'path', 'cookie']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" md="1">
                  <v-btn
                    icon
                    @click="addParam"
                    color="blue"
                    :disabled="!param.name"
                  >
                    <v-icon>
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="addEndpoint" :disabled="!validEndpoint">
                  Add Endpoint
                </v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-card-text>
        </v-container>
      </v-form>
    </v-card>
    <v-dialog v-model="exporting" max-width="50%">
      <v-card>
        <v-card-title>
          OAS
        </v-card-title>
        <v-card-text>
          <v-textarea :value="oas" readonly auto-grow> </v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="downloadOAS">
            Download
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      title: "",
      version: "",
      server: "",
      valid: false,
      exporting: false,
      hasAuth: true,
      auth: {
        type: "apiKey",
        in: "query",
        name: "",
      },
      oas: "",
      endpoints: [],
      ep: {
        path: "",
        method: "get",
        params: [],
      },
      param: {
        name: "",
        in: "query",
      },
      required: [v => !!v || "Required"],
      serverRules: [
        v => !!v || "Required",
        v => v.includes("https://") || "Invalid Server",
      ],
    };
  },
  methods: {
    addEndpoint() {
      this.endpoints.push(this.ep);
      this.ep = {
        path: "",
        method: "get",
        params: [],
      };
    },
    addParam() {
      this.ep.params.push(this.param);
      this.param = { name: "", in: "query" };
    },
    downloadOAS() {
      // credit: https://www.bitdegree.org/learn/javascript-download
      let text = this.oas;
      let filename = `${this.title}.oas.json`;
      let element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:application/json;charset=utf-8," + encodeURIComponent(text)
      );
      element.setAttribute("download", filename);

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    },
    deleteParam(i) {
      this.ep.params.splice(i, 1);
    },

    deleteEndpoint(i) {
      this.endpoints.splice(i, 1);
    },
    exportOAS() {
      const { title, version, server, hasAuth, auth, endpoints } = this;
      console.log({ title, version, server, hasAuth, auth, endpoints });
      let oas = {
        openapi: "3.0.1",
        info: {
          title,
          version,
        },
        servers: [{ url: server }],
        paths: [],
      };
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
                  description: "Auto generated using Swagger Inspector",
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

        oas.paths.push(path);
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
      this.oas = JSON.stringify(oas, null, 2);
      this.exporting = true;
    },
  },

  computed: {
    validEndpoint() {
      if (this.ep.path) return true;
      else return false;
    },
  },
};
</script>
