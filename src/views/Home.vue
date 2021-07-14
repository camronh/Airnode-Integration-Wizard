<template>
  <v-container>
    <br />

    <v-row align="center" justify="center">
      <v-card max-width="80%" width="90%">
        <v-form v-model="valid">
          <v-card-title>
            API Settings
            <v-spacer></v-spacer>
            <v-btn text @click="importing = true" color="primary">
              Import
              <v-icon right>
                mdi-import
              </v-icon>
            </v-btn>
            <v-btn
              @click="exportConfig"
              text
              color="primary"
              :disabled="!valid || !endpoints.length || missingReservedParam"
            >
              Export
              <v-icon right>
                mdi-export
              </v-icon>
            </v-btn>
          </v-card-title>
          <v-card-title>
            <v-spacer></v-spacer>
            <v-text-field
              placeholder="Title"
              v-model="title"
              class="titleField ma-1"
              :rules="required"
              height="40px"
            ></v-text-field>
            <v-spacer></v-spacer>
          </v-card-title>
          <v-container>
            <v-row align="center" justify="center">
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="server"
                  placeholder="https://api.website.com/v2"
                  label="Server"
                  :rules="serverRules"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="version"
                  label="Version"
                  required
                  :rules="required"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center" justify="center">
              <v-col cols="12" md="9">
                <v-text-field
                  v-model="RPC"
                  placeholder="https://rinkeby.infura.io/v3/{ FILL }"
                  label="RPC URL"
                  :rules="serverRules"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center" justify="center">
              <v-col cols="12" md="3">
                <v-checkbox label="Auth" v-model="hasAuth"> </v-checkbox>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="auth.type"
                  :disabled="!hasAuth"
                  label="Type"
                  :items="['apiKey']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  :disabled="!hasAuth"
                  v-model="auth.in"
                  label="In"
                  :items="['query', 'header']"
                  required
                ></v-select>
              </v-col>
            </v-row>
            <v-row align="center" justify="center">
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
              <v-col cols="12" md="5">
                <v-text-field
                  :disabled="!hasAuth"
                  v-model="auth.value"
                  label="Value"
                  placeholder="xxxxxxxxxapi_keyxxxxxxx"
                  :rules="hasAuth ? required : false"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center" justify="center">
              <v-col cols="12" md="1"></v-col>
              <v-col cols="12" md="11">
                <v-card-title>
                  Endpoints
                </v-card-title>
                <v-card-text>
                  <template>
                    <v-chip
                      v-for="(endpoint, i) of endpoints"
                      :key="i"
                      close
                      class="ma-1"
                      outlined
                      :color="endpoint.reservedParam.path ? '' : 'red'"
                      label
                      @click="editEndpoint(i)"
                      @click:close="deleteEndpoint(i)"
                    >
                      {{ endpoint.path }} - {{ endpoint.method }}
                    </v-chip>
                    <v-chip
                      outlined
                      label
                      color="primary"
                      @click="newEndpoint"
                      class="ma-1"
                    >
                      <v-icon left>mdi-plus</v-icon>
                      Add Endpoint
                    </v-chip>
                  </template>
                  <br />
                </v-card-text>
              </v-col>
            </v-row>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-row>
    <v-dialog
      v-model="endpointMenu"
      max-width="60%"
      :overlay-opacity="75"
      overlay-color="black"
    >
      <v-card>
        <v-card-title>
          {{ editing ? "Edit" : "New" }} Endpoint
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>

          <v-btn
            @click="saveEndpoint"
            :disabled="!validEndpoint"
            text
            color="primary"
          >
            Save
          </v-btn>
          <v-btn @click="endpointMenu = false" text color="red">
            Close
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="5">
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
        </v-card-text>
        <br />
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-card height="100%" flat>
                <v-card-title>
                  Params
                </v-card-title>

                <v-card-text>
                  <v-row align="center">
                    <v-col cols="12" md="7">
                      <v-text-field
                        v-model="param.name"
                        label="Param Name"
                        placeholder="ex. currency"
                        @keypress.enter="addParam"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-select
                        v-model="param.in"
                        label="In"
                        :items="['query', 'header', 'path', 'cookie']"
                        required
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="1">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            icon
                            @click="addParam"
                            color="primary"
                            :disabled="
                              !param.name || (param.fixed && !param.value)
                            "
                            v-bind="attrs"
                            v-on="on"
                          >
                            <v-icon>
                              mdi-plus
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>Add Param</span>
                      </v-tooltip>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-checkbox label="Fixed" v-model="param.fixed">
                      </v-checkbox>
                    </v-col>
                    <v-col cols="12" md="9">
                      <v-text-field
                        label="Value"
                        :disabled="!param.fixed"
                        v-model="param.value"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <!-- <v-row>
                    <v-col cols="12" md="12">
                      <v-checkbox label="Fixed"> </v-checkbox>
                    </v-col>
                  </v-row> -->
                </v-card-text>
                <v-card-text>
                  <template v-if="ep.params.length">
                    <v-chip
                      v-for="(param, i) of ep.params"
                      :key="param.name"
                      close
                      label
                      :color="param.fixed ? 'accent' : ''"
                      class="ma-1"
                      outlined
                      @click:close="deleteParam(i)"
                    >
                      {{ param.name }} - {{ param.in }}
                    </v-chip>
                  </template>
                  <p v-else>
                    No params...
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card flat height="100%">
                <v-card-title>
                  Reserved Params
                  <v-spacer></v-spacer>
                  <v-spacer></v-spacer>
                  <v-spacer></v-spacer>
                  <v-spacer></v-spacer>
                  <v-spacer></v-spacer>
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="5">
                      <v-select
                        v-model="rp.type"
                        label="__type"
                        :items="['int256', 'bytes32', 'bool']"
                        required
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="2"></v-col>
                    <v-col cols="12" md="5">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-checkbox
                            v-model="rp.times"
                            label="Add __times"
                            :disabled="rp.type != 'int256'"
                            v-bind="attrs"
                            v-on="on"
                          >
                          </v-checkbox>
                        </template>
                        <span>Add Param</span>
                      </v-tooltip>
                    </v-col>
                    <v-col cols="12" md="12">
                      <v-text-field
                        label="__path"
                        :autofocus="!rp.path"
                        v-model="rp.path"
                        :error="!rp.path"
                        placeholder="data.prices.0.ask"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row> </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="importing" max-width="50%">
      <v-card>
        <v-card-title>
          Import {{ importType }}
          <v-spacer></v-spacer>
          <v-btn-toggle v-model="importType" tile color="primary" group>
            <v-btn value="OAS">
              OAS / Swagger
            </v-btn>
            <v-btn value=".Config">
              Config
            </v-btn>
          </v-btn-toggle>
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="importString"
            rows="20"
            autofocus
            no-resize
            :error="importError"
          >
          </v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="importing = false"
            :disabled="importError"
            text
            color="primary"
            block
          >
            Import
            <v-icon right>
              mdi-import
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="exporting" max-width="50%">
      <v-card>
        <v-card-title>
          Export
        </v-card-title>
        <v-card-subtitle>
          Edit your config.json
        </v-card-subtitle>
        <v-card-text>
          <v-jsoneditor
            v-model="exportJson"
            :plus="true"
            @error="importError = true"
            height="600px"
            :options="options"
          >
          </v-jsoneditor>

          <!-- <v-textarea
            v-model="exportStr"
            :error="importError"
            rows="20"
            :color="editingConfig ? 'primary' : 'grey'"
            append-icon="mdi-pencil"
            @click:append="editingConfig = !editingConfig"
            :readonly="!editingConfig"
            autofocus
          >
          </v-textarea> -->
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="12" md="4">
              <v-btn
                @click="downloadOAS"
                text
                color="primary"
                block
                :disabled="
                  importError ||
                    !valid ||
                    !endpoints.length ||
                    missingReservedParam
                "
              >
                OAS / Swagger
                <v-icon right>
                  mdi-download
                </v-icon>
              </v-btn>
            </v-col>
            <v-col cols="12" md="4">
              <v-btn
                @click="downloadDeployment"
                text
                color="primary"
                block
                :disabled="
                  importError ||
                    !valid ||
                    !endpoints.length ||
                    missingReservedParam
                "
              >
                Deployment Package
                <v-icon right>
                  mdi-download
                </v-icon>
              </v-btn>
            </v-col>
            <v-col cols="12" md="4">
              <v-btn
                @click="downloadReadme"
                text
                color="primary"
                block
                :disabled="
                  importError ||
                    !valid ||
                    !endpoints.length ||
                    missingReservedParam
                "
              >
                Readme.md
                <v-icon right>
                  mdi-download
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import utils from "../utils/utils";
import VJsoneditor from "v-jsoneditor/src/index";

export default {
  name: "Home",
  components: {
    VJsoneditor,
  },
  data() {
    return {
      title: "",
      version: "",
      server: "",
      importString: "",
      exportStr: "{}",
      valid: false,
      options: {
        mode: "code",
        enableTransform: false,
      },
      RPC: "",
      importError: false,
      exportType: "oas",
      importType: "OAS",
      exporting: false,
      importing: false,
      editing: false,
      exportJson: {},
      editingConfig: false,
      endpointMenu: false,
      hasAuth: true,
      auth: {
        type: "apiKey",
        in: "query",
        name: "",
        value: "",
      },
      oas: "",
      endpoints: [],
      ep: {
        path: "",
        method: "get",
        params: [],
        reservedParam: {
          type: "int256",
          path: "",
          times: false,
        },
      },
      rp: {
        type: "int256",
        path: "",
        times: false,
      },
      param: {
        name: "",
        in: "query",
        fixed: false,
        value: "",
      },
      required: [v => !!v || "Required"],
      serverRules: [
        v => !!v || "Required",
        v => v.includes("://") || "Invalid Server",
      ],
    };
  },
  watch: {
    importString() {
      console.log("Changed");
      this.importError = false;
      this.parseImport();
    },
    exportJson() {
      console.log("Changed");
      this.exportStr = JSON.stringify(this.exportJson, null, 2);
      this.importString = this.exportStr;
      this.importError = false;
      this.parseImport();
    },
  },
  methods: {
    saveEndpoint() {
      this.ep.reservedParam = this.rp;
      if (!this.editing) this.endpoints.push(this.ep);
      else this.endpoints[this.editIndex] = this.ep;
      this.ep = {
        path: "",
        method: "get",
        params: [],
        reservedParam: {
          type: "int256",
          path: "",
          times: false,
        },
      };
      this.endpointMenu = false;
    },
    addParam() {
      if (!this.param.name) return;
      this.ep.params.push(this.param);
      this.param = { name: "", in: "query", fixed: false, value: "" };
      // sort this.ep.params by name
      this.ep.params.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    },
    downloadReadme() {
      const text = utils.makeReadme(JSON.parse(this.exportStr));
      let filename = `${this.title}-Readme.md`;
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

    downloadOAS() {
      // credit: https://www.bitdegree.org/learn/javascript-download
      let text = utils.makeOAS(this);
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
    downloadDeployment() {
      utils.zipDeploymentPackage(this);
    },

    deleteParam(i) {
      this.ep.params.splice(i, 1);
    },
    editEndpoint(i) {
      this.ep = this.endpoints[i];
      this.editIndex = i;
      if (!this.ep.reservedParam) {
        console.log("No reserved param");
        console.log(this.ep);
        this.rp = {
          type: "int256",
          path: "",
          times: false,
        };
      } else this.rp = this.ep.reservedParam;
      this.editing = true;
      this.endpointMenu = true;
    },
    clearEndpoint() {
      this.ep = {
        path: "",
        method: "get",
        params: [],
        reservedParam: {
          type: "int256",
          path: "",
          times: false,
        },
      };
    },

    deleteEndpoint(i) {
      this.endpoints.splice(i, 1);
    },
    newEndpoint() {
      this.ep = {
        path: "",
        method: "get",
        params: [],
        reservedParam: {
          type: "int256",
          path: "",
          times: false,
        },
      };
      this.rp = this.ep.reservedParam;
      this.editing = false;
      this.endpointMenu = true;
    },
    exportConfig() {
      this.oas = utils.makeOAS(this);
      this.exportStr = utils.makeConfig(this);
      this.exportJson = JSON.parse(this.exportStr);
      this.importType = ".Config";
      this.exporting = true;
    },

    parseImport() {
      let apiValue;
      if (this.auth.value) apiValue = this.auth.value;
      try {
        const json = JSON.parse(this.importString);
        console.log({ json });
        console.log("Parsing");
        let state;
        if (this.importType == "OAS") {
          state = utils.parseOAS(json);
        } else {
          state = utils.parseConfig(json);
        }
        console.log({ state });
        Object.keys(state).forEach(key => {
          this[key] = state[key];
        });
        this.auth.value = apiValue;
      } catch (error) {
        console.log(error);
        this.importError = true;
      }
    },
  },

  computed: {
    validEndpoint() {
      if (this.ep.path && this.rp.path) return true;
      else return false;
    },
    endpointPath() {
      console.log(this.ep);
      return this.ep.path;
    },

    missingReservedParam() {
      let missing = false;
      for (let i = 0; i < this.endpoints.length; i++) {
        if (!this.endpoints[i].reservedParam.path) {
          missing = true;
          break;
        }
      }
      return missing;
    },
  },
};
</script>

<style scoped>
.titleField {
  font-size: 1.6em;
}
</style>
