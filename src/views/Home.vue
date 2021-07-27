<template>
  <v-container>
    <v-app-bar app color="dark" dark>
      <div class="d-flex align-center">
        <h1>
          A I W
        </h1>
      </div>
      <v-spacer></v-spacer>
      <!-- <v-btn icon color="primary" @click="infoDialog = true">
        <v-icon>
          mdi-information-outline
        </v-icon>
      </v-btn> -->
    </v-app-bar>
    <br />

    <v-row align="center" justify="center">
      <v-card max-width="80%" width="90%">
        <v-form v-model="valid">
          <v-card-title>
            API Settings
            <v-spacer></v-spacer>
            <!-- <v-btn text @click="importing = true" color="primary" icon>
              <v-icon>
                mdi-import
              </v-icon>
            </v-btn>
            <v-btn
              @click="exportConfig"
              text
              icon
              color="primary"
            >
              <v-icon>
                mdi-export
              </v-icon>
            </v-btn> -->
            <v-menu bottom left v-if="!selectingEndpoint">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" id="menuButton">
                  <v-icon>
                    mdi-dots-vertical
                  </v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item-group>
                  <v-list-item id="import" @click="importing = true">
                    <v-list-item-title
                      >Import
                      <v-icon right>
                        mdi-import
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :disabled="!valid || !endpoints.length"
                    @click="exportConfig"
                    id="export"
                  >
                    <v-list-item-title>
                      Export
                      <v-icon right :disabled="!valid || !endpoints.length">
                        mdi-export
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :disabled="!endpoints.length"
                    id="cloneEndpoint"
                    @click="selectingEndpoint = true"
                  >
                    <v-list-item-title>Clone Endpoint</v-list-item-title>
                  </v-list-item>
                  <v-list-item id="addRPC" @click="extraRPC = true">
                    <v-list-item-title>Add RPC</v-list-item-title>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-menu>
            <v-btn icon v-else @click="selectingEndpoint = false">
              <v-icon>
                mdi-close
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
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="RPCs[0]"
                  placeholder="https://rinkeby.infura.io/v3/{ FILL }"
                  label="RPC URL"
                  :rules="serverRules"
                  id="rpcURL"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center" justify="center" v-if="extraRPC">
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="RPCs[1]"
                  placeholder="https://rinkeby.infura.io/v3/{ FILL }"
                  label="RPC URL"
                  autofocus
                  :rules="serverRules"
                  @blur="RPCs[1] ? '' : (extraRPC = false)"
                  id="rpcURL2"
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
              <v-col cols="12" md="3">
                <v-text-field
                  :disabled="!hasAuth"
                  v-model="auth.name"
                  label="Name"
                  placeholder="X-API-KEY"
                  :rules="hasAuth ? required : false"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :disabled="!hasAuth"
                  v-model="auth.value"
                  label="Value"
                  placeholder="XXXAPI_KEYXXX (Leave blank if N/A)"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center" justify="center">
              <v-col cols="12" md="1"></v-col>
              <v-col cols="12" md="11">
                <v-card-title>
                  Endpoints
                  <v-spacer></v-spacer>
                </v-card-title>
                <v-card-text>
                  <template v-if="!selectingEndpoint">
                    <v-chip
                      v-for="(endpoint, i) of endpoints"
                      :key="i"
                      close
                      class="ma-1"
                      outlined
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
                  <template v-else>
                    <v-btn
                      v-for="(endpoint, i) of endpoints"
                      :key="i"
                      class="ma-1"
                      @click="cloneEndpoint(endpoint)"
                    >
                      {{ endpoint.path }} - {{ endpoint.method }}
                    </v-btn>
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
      persistent
      overlay-color="black"
    >
      <v-card>
        <v-card-title>
          {{ editing ? "Edit" : "New" }} Endpoint
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>

          <v-btn @click="endpointMenu = false" icon>
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="5">
              <v-text-field
                v-model="ep.path"
                label="Path"
                id="path"
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
            <v-col cols="12" md="12">
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
                        id="paramName"
                        placeholder="ex. currency"
                        @keypress.enter="addParam"
                        ref="paramName"
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
                        @keypress.enter="addParam"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text>
          <template v-if="ep.params.length">
            <v-chip
              v-for="(p, i) of ep.params"
              :key="p.name"
              close
              label
              :color="p.fixed ? 'accent' : ''"
              class="ma-1"
              outlined
              @click="editParam(p, i)"
              @click:close="deleteParam(i)"
            >
              {{ p.name }} - {{ p.in }}
            </v-chip>
          </template>
          <p v-else>
            No params...
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="saveEndpoint"
            :disabled="!validEndpoint"
            text
            color="primary"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="importing" max-width="50%">
      <v-card>
        <v-card-title>
          Import {{ importType }}
          <v-spacer></v-spacer>
          <v-btn-toggle
            v-model="importType"
            tile
            color="primary"
            group
            @change="parseImport"
          >
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
            placeholder="Paste Import Here..."
            @input="parseImport"
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
            type="submit"
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
    <v-dialog v-model="exporting" max-width="50%" :overlay-opacity="75">
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
        </v-card-text>

        <v-btn block @click="downloading = true" text color="primary">
          Download
        </v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="downloading" max-width="400px">
      <v-card>
        <v-card-title>
          Download Options
        </v-card-title>
        <v-card-text>
          <v-row align="center" justify="center">
            <v-col cols="12" md="5">
              <v-checkbox
                label="OAS"
                v-model="downloadOptions"
                value="OAS"
              ></v-checkbox>
              <v-checkbox
                label="OIS"
                v-model="downloadOptions"
                value="OIS"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox
                label="Readme.md"
                v-model="downloadOptions"
                value="Readme"
              ></v-checkbox>
              <v-checkbox
                label="Deployment Pkg"
                v-model="downloadOptions"
                value="Deployment"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-btn
            text
            block
            @click="download"
            :disabled="!downloadOptions.length"
          >
            <v-icon>
              mdi-download
            </v-icon>
          </v-btn>
        </v-card-text>
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
      RPCs: [""],
      extraRPC: false,
      importError: false,
      exportType: "oas",
      importType: "OAS",
      exporting: false,
      importing: false,
      selectingEndpoint: false,
      downloading: false,
      editing: false,
      downloadOptions: ["OAS", "OIS", "Readme", "Deployment"],
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
        // reservedParam: {
        //   type: "int256",
        //   path: "",
        //   times: false,
        // },
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
    exportJson() {
      console.log("Changed");
      this.exportStr = JSON.stringify(this.exportJson, null, 2);
      this.importString = this.exportStr;
      this.parseImport();
    },
  },
  methods: {
    saveEndpoint() {
      // this.ep.reservedParam = this.rp;
      // if endpoint.path exists in endpoints get index
      const duplicateIndex = this.endpoints.findIndex(
        v => v.path === this.ep.path
      );
      console.log({ duplicateIndex });
      if (duplicateIndex > -1) this.endpoints[duplicateIndex] = this.ep;
      else if (!this.editing) this.endpoints.push(this.ep);
      else this.endpoints[this.editIndex] = this.ep;
      this.ep = {
        path: "",
        method: "get",
        params: [],
        // reservedParam: {
        //   type: "int256",
        //   path: "",
        //   times: false,
        // },
      };
      this.endpointMenu = false;
    },
    addParam() {
      if (!this.param.name || (this.param.fixed && !this.param.value)) return;
      this.ep.params.push(this.param);
      this.param = { name: "", in: "query", fixed: false, value: "" };
      // sort this.ep.params by name
      this.ep.params.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      this.$refs.paramName.focus();
    },
    editParam(param, index) {
      if (this.param.name || this.param.value) return;
      this.param = param;
      this.ep.params.splice(index, 1);
    },

    download() {
      utils.makeZip(this);
    },

    deleteParam(i) {
      this.ep.params.splice(i, 1);
    },
    editEndpoint(i) {
      this.ep = this.endpoints[i];
      this.editIndex = i;
      // if (!this.ep.reservedParam) {
      //   console.log("No reserved param");
      //   console.log(this.ep);
      //   this.rp = {
      //     type: "int256",
      //     path: "",
      //     times: false,
      //   };
      // } else this.rp = this.ep.reservedParam;
      this.editing = true;
      this.endpointMenu = true;
    },
    clearEndpoint() {
      this.ep = {
        path: "",
        method: "get",
        params: [],
        // reservedParam: {
        //   type: "int256",
        //   path: "",
        //   times: false,
        // },
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
        // reservedParam: {
        //   type: "int256",
        //   path: "",
        //   times: false,
        // },
      };
      // this.rp = this.ep.reservedParam;
      this.editing = false;
      this.endpointMenu = true;
    },
    cloneEndpoint(endpoint) {
      this.ep = { ...endpoint };
      // this.rp = this.ep.reservedParam;
      this.editing = false;
      this.endpointMenu = true;
      this.selectingEndpoint = false;
    },
    exportConfig() {
      this.oas = utils.makeOAS(this);
      this.exportStr = utils.makeConfig(this);
      this.exportJson = JSON.parse(this.exportStr);
      this.importType = ".Config";
      this.exporting = true;
    },

    parseImport() {
      this.importError = false;
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
      if (this.ep.path) return true;
      else return false;
    },
    endpointPath() {
      console.log(this.ep);
      return this.ep.path;
    },
  },
};
</script>

<style scoped>
.titleField {
  font-size: 1.6em;
}
</style>
