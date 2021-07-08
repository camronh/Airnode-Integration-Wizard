<template>
  <v-container>
    <v-card>
      <v-form v-model="valid">
        <v-card-title>
          <v-text-field
            placeholder="Title"
            v-model="title"
            class="titleField"
            :rules="required"
            height="40px"
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <!-- <v-btn
            @click="exportOAS"
            outlined
            color="primary"
            :disabled="!valid || !endpoints.length"
          > -->
          <v-btn @click="exportOAS" outlined color="primary">
            Export
            <v-icon right>
              mdi-export
            </v-icon>
          </v-btn>
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
            <v-col cols="12" md="1">
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
            <template v-if="endpoints.length">
              <v-chip
                v-for="(endpoint, i) of endpoints"
                :key="endpoint.path"
                close
                outlined
                large
                label
                @click="ep = endpoint"
                @click:close="deleteEndpoint(i)"
              >
                {{ endpoint.path }} - {{ endpoint.method }}
              </v-chip>
            </template>
            <p v-else>
              Add Endpoints below...
            </p>
            <br />
            <v-card>
              <v-card-title>
                New Endpoint
                <v-spacer></v-spacer>
                <v-btn
                  @click="clearEndpoint"
                  :disabled="!validEndpoint"
                  text
                  color="red"
                >
                  Clear
                </v-btn>
                <v-btn
                  @click="addEndpoint"
                  :disabled="!validEndpoint"
                  text
                  color="primary"
                >
                  Add Endpoint
                </v-btn>
              </v-card-title>
              <v-row align="center" justify="center">
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
              <v-card-text>
                <h2 class="text-h6 mb-2">
                  Params
                </h2>
                <template v-if="ep.params.length">
                  <v-chip
                    v-for="(param, i) of ep.params"
                    :key="param.name"
                    close
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
              <v-row align="center" justify="center">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="param.name"
                    label="Param Name"
                    placeholder="ex. currency"
                    @keypress.enter="addParam"
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
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        @click="addParam"
                        color="primary"
                        :disabled="!param.name"
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
              </v-row>
              <v-card-actions>
                <v-spacer></v-spacer>

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
          <v-spacer></v-spacer>
          <v-btn-toggle v-model="exportType" tile color="primary" group>
            <v-btn value="oas">
              OAS
            </v-btn>
            <v-btn value="config">
              Config
            </v-btn>
          </v-btn-toggle>
        </v-card-title>
        <v-card-text>
          <v-textarea
            :value="exportType == 'config' ? config : oas"
            readonly
            rows="20"
            autofocus
            no-resize
          >
          </v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="download"
            text
            color="primary"
            block
          >
            Download
            <v-icon right>
              mdi-download
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import utils from "../utils/utils";

export default {
  name: "Home",
  data() {
    return {
      title: "",
      version: "",
      server: "",
      valid: false,
      exportType: "oas",
      exporting: false,
      hasAuth: true,
      auth: {
        type: "apiKey",
        in: "query",
        name: "",
      },
      oas: "",
      config: "",
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
  watch: {
    // sort ep.params by name
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
      // sort this.ep.params by name
      this.ep.params.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    },
    download() {
      // credit: https://www.bitdegree.org/learn/javascript-download
      let text, filename;
      if (this.exportType === "oas") {
        text = this.oas;
        filename = `${this.title}.oas.json`;
      } else {
        text = this.config;
        filename = `${this.title}.config.json`;
      }
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
    clearEndpoint() {
      this.ep = {
        path: "",
        method: "get",
        params: [],
      };
    },

    deleteEndpoint(i) {
      this.endpoints.splice(i, 1);
    },
    exportOAS() {
      this.oas = utils.makeOAS(this);
      this.config = utils.makeConfig(this);
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

<style scoped>
.titleField {
  font-size: 1.6em;
}
</style>
