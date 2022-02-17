<template>
  <v-container>
    <v-app-bar app color="dark" dark>
      <div class="d-flex align-center">
        <v-btn text flat to="/">
          <h1>
            A I W
          </h1>
        </v-btn>
      </div>
      <v-spacer></v-spacer>

      <v-chip
        label
        large
        @click="getStats"
        outlined
        color="primary"
        v-if="connected"
        :ripple="false"
      >
        Wallet Connected!
        <br />
        {{ address }}
      </v-chip>
      <!-- <v-btn icon color="primary" @click="infoDialog = true">
        <v-icon>
          mdi-information-outline
        </v-icon>
      </v-btn> -->
    </v-app-bar>
    <br />
    <v-row align="center" justify="center">
      <v-card max-width="95%" width="90%">
        <v-card-title>
          Testing Suite
        </v-card-title>
        <v-card-text>
          <p v-if="!connected">
            Please connect your Metamask wallet
          </p>
          <v-form v-else>
            <v-row>
              <v-col cols="12" md="4">
                <v-card-text>
                  <v-autocomplete
                    :items="configNames"
                    auto-select-first
                    :loading="gettingConfigs"
                    :disabled="gettingConfigs"
                    label="Config"
                    v-model="selectedConfig"
                    @change="getConfig"
                  />
                  <v-autocomplete
                    auto-select-first
                    label="Endpoint"
                    :items="endpointNames"
                    v-model="selectedEndpoint"
                    @change="parseStoredEndpoint"
                  />
                </v-card-text>
              </v-col>
              <v-col cols="12" md="8" align="center" justify="center">
                <v-card
                  elevation="1"
                  color="grey darken-3"
                  height="200"
                  tile
                  width="80%"
                  :loading="savingReceipt"
                  @drop.prevent="saveReceipt($event)"
                  @dragover.prevent="dragover = true"
                  @dragenter.prevent="dragover = true"
                  @dragleave.prevent="dragover = false"
                  :class="{ accent: dragover }"
                >
                  <template slot="progress">
                    <v-progress-linear
                      color="accent"
                      height="5"
                      indeterminate
                    ></v-progress-linear>
                  </template>
                  <v-card-text>
                    <template v-if="receipt.airnodeWallet">
                      <v-card-title>
                        Sponsor Wallet
                        <v-spacer> </v-spacer>
                        {{ sponsorWalletBalance }} ETH
                      </v-card-title>
                      <v-card-subtitle align="left">
                        Address: {{ sponsorWalletAddress }}
                      </v-card-subtitle>
                      <v-card-title>
                        Receipt
                        <v-spacer> </v-spacer>

                        <v-chip color="primary" small outlined>
                          <v-icon left>
                            mdi-check
                          </v-icon>
                          Receipt Found!
                        </v-chip>
                      </v-card-title>
                      <!-- <v-card-subtitle align="left">
                        Master Wallet:
                        {{ receipt.masterWalletAddress }}
                      </v-card-subtitle> -->
                    </template>
                    <template v-else-if="config.id && !receipt.providerId">
                      <v-card-title>
                        Receipt
                      </v-card-title>
                      <v-card-subtitle align="left">
                        Missing Receipt. Drag and drop a receipt.json here.
                      </v-card-subtitle>
                    </template>
                    <template v-else>
                      <v-card-title>
                        Receipt
                      </v-card-title>
                      <v-card-subtitle align="left">
                        Select a config on the left
                      </v-card-subtitle>
                    </template>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-card-title>
              Params
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="12" align="center" justify="center">
                  <v-autocomplete
                    multiple
                    chips
                    small-chips
                    deletable-chips
                    :items="paramsList"
                    @change="storeEndpoint"
                    v-model="selectedParams"
                  >
                  </v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col
                  v-for="param of selectedParams"
                  :key="param"
                  cols="12"
                  md="4"
                >
                  <v-card color="grey darken-3">
                    <v-card-text>
                      <v-row justify="center" align="center">
                        <v-col cols="12" md="7">
                          <v-card-title class="text-no-wrap paramTitle">
                            {{ param }}
                          </v-card-title>
                        </v-col>
                        <v-col cols="12" md="5">
                          <v-select
                            :items="[
                              'bytes32',
                              'string32',
                              'bytes',
                              'string',
                              'address',
                              'int256',
                              'uint256',
                            ]"
                            label="Type"
                            @change="storeEndpoint"
                            v-model="paramTypes[param]"
                          >
                          </v-select>
                        </v-col>
                        <v-col cols="12" md="11">
                          <v-text-field
                            label="Value"
                            outlined
                            @change="storeEndpoint"
                            v-model="paramValues[param]"
                            v-if="param !== '_type'"
                          />
                          <v-select
                            v-else
                            label="Value"
                            outlined
                            :items="[
                              'bytes32',
                              'string32',
                              'bytes',
                              'string',
                              'address',
                              'int256',
                              'uint256',
                            ]"
                            @change="storeEndpoint"
                            v-model="paramValues[param]"
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-form>
        </v-card-text>
        <v-card-actions v-if="connected">
          <v-card-text justify="center" align="center">
            <!-- <v-btn
              class="ma-2"
              outlined
              tile
              color="primary"
              :disabled="!admin || !receipt.masterWalletAddress"
            >
              Fund Master Wallet
            </v-btn> -->
            <v-btn
              class="ma-2"
              outlined
              tile
              color="primary"
              @click="makeHttpRequest"
              :disabled="
                !selectedConfig ||
                  !selectedEndpoint ||
                  !paramsAreValid ||
                  !receipt.api.httpGatewayUrl ||
                  !gatewayKey
              "
            >
              HTTP Gateway Request
            </v-btn>
            <v-btn
              class="ma-2"
              outlined
              tile
              :disabled="
                !selectedConfig ||
                  !selectedEndpoint ||
                  !paramsAreValid ||
                  !receipt.airnodeWallet
              "
              color="primary"
              @click="makeRequest"
            >
              Make Request
            </v-btn>
          </v-card-text>
        </v-card-actions>
      </v-card>
    </v-row>
    <!-- <vue-metamask userMessage="msg" @onComplete="onComplete" /> -->
    <v-dialog v-model="loading" persistent width="300">
      <v-card>
        <v-card-title>
          Loading...
          <v-progress-linear
            indeterminate
            color="primary"
            class="mb-0"
          ></v-progress-linear>
        </v-card-title>
      </v-card>
    </v-dialog>
    <v-dialog v-model="requestDialog" persistent width="700">
      <v-card>
        <v-card-title>
          Request
          <v-spacer></v-spacer>
          <v-btn icon @click="requestDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-textarea
            label="Logs"
            :value="requestResults"
            readonly
            :loading="makingRequest"
            auto-grow
          >
          </v-textarea>
        </v-card-text>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                label="_type"
                :items="['bytes32', 'int256', 'bool']"
                v-model="parseType"
              >
              </v-select>
            </v-col>
            <v-col cols="12" md="9">
              <v-text-field
                label="Result"
                readonly
                v-model="parsedResult"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="httpRequestDialog" persistent fullscreen>
      <v-card>
        <v-card-title>
          HTTP Request
          <v-spacer></v-spacer>
          <v-btn icon @click="httpRequestDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                label="HTTP Gateway Key"
                v-model="gatewayKey"
                :loading="makingHttpRequest"
                append-icon="mdi-floppy"
                @click:append="saveGatewayKey"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-card color="grey darken-3" height="100%">
                <v-card-title>
                  Raw Value
                </v-card-title>
                <v-card-text>
                  <v-textarea
                    readonly
                    height="100%"
                    :value="JSON.stringify(httpResponse.rawValue, null, 2)"
                  >
                  </v-textarea>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card color="grey darken-3">
                <v-card-title>
                  Encoded Data
                </v-card-title>
                <v-card-text>
                  {{ httpResponse.encodedValue }}
                </v-card-text>
              </v-card>
              <br />
              <v-card color="grey darken-3">
                <v-card-title>Values</v-card-title>

                <v-card-text>
                  <v-text-field
                    outlined
                    dense
                    readonly
                    v-for="(value, i) of httpResponse.values"
                    :key="i"
                    :label="i.toString()"
                    :value="value"
                  >
                  </v-text-field>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <!-- <pre>{{ JSON.stringify(config, null, 2) }}</pre> -->
        </v-card-text>
        <v-card-actions>
          <v-row align="center" justify="center">
            <v-btn tile outlined color="primary" @click="makeHttpRequest">
              Make Request
            </v-btn>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="snackbarColor" light>
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
// import VueMetamask from "vue-metamask";
import utils from "../utils/utils";
// import ethers from "ethers";

export default {
  components: {
    // VueMetamask,
  },
  data() {
    return {
      valid: false,
      msg: "This is demo net work",
      connected: false,
      gettingConfigs: false,
      savingReceipt: false,
      makingRequest: true,
      makingHttpRequest: true,
      loading: false,
      dragover: false,
      requestDialog: false,
      requestDialogMsg: "",
      httpRequestDialog: false,
      snackbarText: "",
      snackbar: false,
      snackbarColor: "",
      sponsorStatus: false,
      selectedConfig: "",
      selectedEndpoint: "",
      parseType: "string32",
      result: "",
      requestResults: "",
      address: "",
      paramValues: {
        _type: "string32",
      },
      paramTypes: {
        _path: "string32",
        _type: "string32",
        _times: "string32",
      },
      httpResponse: {},
      chainID: "",
      configNames: [],
      selectedParams: ["_path", "_type"],
      receipt: {},
      config: {},
      gatewayKey: "",
      ethers: null,
      // web3: null,
      sponsorWalletBalance: 0,
      sponsorWalletAddress: "",
      sponsorAddress: "0xe2dB4f54F8FAB66e44386e49aFcB3EF4a87a8787",
    };
  },
  async mounted() {
    try {
      const ethers = require("ethers");
      // await window.ethereum.enable();
      this.ethers = ethers;
      this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const { chainId } = await this.provider.getNetwork();
      this.chainID = chainId;
      await this.provider.send("eth_requestAccounts", []);

      this.signer = this.provider.getSigner();
      this.address = await this.signer.getAddress();
      if (this.address) this.connected = true;
      await this.getStats();
    } catch (error) {
      console.log(error);
    }
  },
  computed: {
    endpoints() {
      if (!this.config.nodeSettings) return false;
      let endpoints = this.config.ois[0].endpoints;
      for (let endpoint of endpoints) {
        let triggers = this.config.triggers.rrp || this.config.triggers.request;
        let { endpointId } = triggers.find(
          (trigger) => trigger.endpointName == endpoint.name
        );
        endpoint.endpointId = endpointId;
      }
      return endpoints;
    },
    airnodeAddress() {
      switch (Number(this.chainID)) {
        case 4:
          // Rinkeby Airnode Address
          return "0xC11593B87f258672b8eB02d9A723a429b15E9E03";
        case 31:
          // RSK Airnode Address
          return "0x1190a5e1f2afe4c8128fd820a7ac85a95a9e6e3e";
        case 3:
          // Ropsten Airnode Address
          return "0x3B35250Ca54C1Fb8c83D48F21231ef6e4fb9f79D";
      }
      throw new Error("Chain ID not found");
    },
    requestClientAddress() {
      switch (Number(this.chainID)) {
        case 4:
          // Rinkeby Client Address
          return "0x1080Be09F5a44212e807ea31F85E18C92AdCc5B7";
        case 31:
          // RSK Client Address
          return "0x53fd43cc0559F35E82E53F830a35cA868874b687";
        case 3:
          // Ropsten Client Address
          return "0x3d0c6D6131A9AAE4FE5B78405bE5544d62039Be4";
      }
      throw new Error("Chain ID not found");
    },
    paramsList() {
      const reservedParams = ["_type", "_times", "_path"];

      if (!this.config.nodeSettings) reservedParams;
      if (!this.selectedEndpoint) return reservedParams;
      try {
        const endpoint = this.endpoints.find(
          (endpoint) => endpoint.name === this.selectedEndpoint
        );
        let params = endpoint.parameters.map((param) => param.name);
        params.push(...reservedParams);
        console.log({ params });
        return params;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    paramsAreValid() {
      for (let param of this.selectedParams) {
        if (!this.paramValues[param]) return false;
        if (!this.paramTypes[param]) return false;
      }
      return true;
    },
    parsedResult() {
      if (!this.parseType) return;
      if (!this.result) return;
      switch (this.parseType) {
        case "int256":
          return Number(this.result);

        case "bool":
          return this.result === "true";
        case "bytes32":
          try {
            return this.ethers.utils.parseBytes32String(this.result);
          } catch (error) {
            console.log(error);
            return "Invalid Bytes32";
          }
        default:
          return this.result;
      }
    },

    paramsData() {
      if (!this.config.nodeSettings) return;
      if (!this.selectedEndpoint) return;
      try {
        let params = this.selectedParams.map((param) => {
          return {
            name: param,
            value: this.paramValues[param],
            type: this.paramTypes[param],
          };
        });
        return params;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    airnode() {
      const airnodeProtocol = require("@api3/airnode-protocol");
      // const ropsetAirnodeAddress = "0xF8d32C3e53F7DA6e7CB82323f2cAB2159776b832";
      // const rinkebyAirnodeAddress =
      //   "0xF9C39ec11055508BddA0Bc2a0234aBbbC09a3DeC";
      // const RSKAirnodeAddress = "0x1190a5e1f2afe4c8128fd820a7ac85a95a9e6e3e";
      console.log(this.chainID, this.airnodeAddress);
      return new this.ethers.Contract(
        this.airnodeAddress,
        airnodeProtocol.AirnodeRrpFactory.abi,
        this.signer
      );
    },

    endpointNames() {
      if (!this.endpoints) return [];
      return this.endpoints.map((endpoint) => endpoint.name);
    },
    endpoint() {
      return this.endpoints.find(
        (endpoint) => endpoint.name === this.selectedEndpoint
      );
    },
  },
  methods: {
    makeSnackbar(message, color = "grey darken-3") {
      this.snackbarText = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    storeEndpoint() {
      try {
        const endpoint = {
          name: this.selectedEndpoint,
          params: this.paramsData,
        };
        localStorage[endpoint.name] = JSON.stringify(endpoint);
        console.log("Stored");
      } catch (error) {
        console.log("Store Failed", error);
      }
    },
    parseStoredEndpoint() {
      try {
        let endpoint = JSON.parse(localStorage[this.selectedEndpoint]);
        console.log({ endpoint });
        if (!endpoint.params) {
          endpoint.params = [
            {
              name: "_type",
              value: "string",
              type: "string",
            },
            {
              name: "_path",
              value: "",
              type: "string32",
            },
          ];
        }
        this.paramValues = {};
        this.paramTypes = {};
        this.selectedParams = [];
        for (let param of endpoint.params) {
          this.selectedParams.push(param.name);
          this.paramTypes[param.name] = param.type;
          // This doesn't work idk why
          // this.paramValues[param.name] = param.value;
        }
        console.log({ values: this.paramValues });
        console.log({ types: this.paramTypes });
      } catch (error) {
        console.log("Parse Failed", error);
      }
    },

    async getStats() {
      console.log("Getting Stats");
      this.gettingConfigs = true;
      this.configNames = await utils.getConfigTitles();
      console.log("Got Configs");
      await this.getSponsorStatus();
      this.gettingConfigs = false;
      console.log("Got Stats");
    },
    async getSponsorWalletStats({ airnodeWallet }) {
      const airnodeAdmin = require("@api3/airnode-admin");

      this.sponsorWalletAddress = await airnodeAdmin.deriveSponsorWalletAddress(
        airnodeWallet.airnodeXpub,
        airnodeWallet.airnodeAddress,
        this.sponsorAddress
      );
      const balanceInWei = await this.provider.getBalance(
        this.sponsorWalletAddress
      );
      const balance = this.ethers.utils.formatEther(balanceInWei.toString());
      this.sponsorWalletBalance = Math.round(balance * 1e4) / 1e4;
    },
    async getConfig() {
      this.receipt = {};
      this.config = {};
      try {
        this.loading = true;
        this.config = await utils.getConfig(this.selectedConfig);
        this.gatewayKey =
          this.config.secrets.gatewayKey || this.config.secrets.gateWayKey;
        this.receipt = await utils.getReceipt(this.selectedConfig);
        console.log({ receipt: this.receipt, config: this.config });
        if (this.receipt && this.receipt.airnodeWallet)
          await this.getSponsorWalletStats(this.receipt);
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },

    async saveReceipt(e) {
      this.savingReceipt = true;
      console.log(e);
      this.dragover = false;
      try {
        if (!this.selectedConfig) throw "Select a Config";
        let receipt = await new Promise((resolve) => {
          if (e.dataTransfer.files.length > 1) {
            console.log("Only 1 at a time");
          } else {
            const file = e.dataTransfer.files[0];
            let reader = new FileReader();
            reader.onload = function(event) {
              const uploadString = event.target.result;
              resolve(JSON.parse(uploadString));
            };
            reader.readAsText(file);
          }
        });
        console.log({ receipt });
        if (receipt.providerId || !receipt.airnodeWallet)
          throw "Invalid Receipt";
        receipt.title = this.selectedConfig;
        await utils.saveReceipt(receipt);
        this.receipt = receipt;
        this.makeSnackbar("Saved!", "primary");
      } catch (error) {
        console.log(error);
        this.makeSnackbar("Failed to store receipt!", "error");
      }
      this.savingReceipt = false;
    },
    async saveGatewayKey() {
      try {
        console.log(this.config);
        const gatewayKey = this.gatewayKey;
        delete this.config.secrets.gateWayKey;
        this.config.secrets.gatewayKey = gatewayKey;
        console.log(this.config);
        await utils.saveConfig(JSON.stringify(this.config));
        console.log("Saved Successfully!");
        this.makeSnackbar("Saved Gateway Key!", "success");
      } catch (error) {
        this.makeSnackbar("Failed to Save Gateway Key", "error");
      }
    },
    async makeRequest() {
      try {
        const endpoint = this.endpoints.find(
          (endpoint) => endpoint.name === this.selectedEndpoint
        );
        let requestObj = {
          airnodeAddress: this.receipt.airnodeWallet.airnodeAddress,
          endpointId: endpoint.endpointId,
          clientAddress: this.requestClientAddress,
          sponsorAddress: this.sponsorAddress,
          artifact: require("../utils/Requester.json"),
        };
        let params = this.selectedParams.map((param) => {
          return {
            name: param,
            value: this.paramValues[param],
            type: this.paramTypes[param],
          };
        });
        requestObj.params = params;
        console.log({ requestObj });
        this.parseType = this.paramValues["_type"];
        const exampleClient = new this.ethers.Contract(
          requestObj.clientAddress,
          requestObj.artifact.abi,
          this.signer
        );

        this.requestDialog = true;
        this.makingRequest = true;
        this.requestResults = "Making the request...";

        console.log("Making the request...");
        const airnodeAbi = require("@api3/airnode-abi");

        const receipt = await exampleClient.makeRequest(
          requestObj.airnodeAddress,
          requestObj.endpointId,
          this.sponsorAddress,
          this.sponsorWalletAddress,
          airnodeAbi.encode(requestObj.params)
        );
        const requestId = await new Promise((resolve) =>
          this.signer.provider.once(receipt.hash, (tx) => {
            const parsedLog = this.airnode.interface.parseLog(tx.logs[0]);
            resolve(parsedLog.args.requestId);
          })
        );
        this.requestResults += `\nMade request!\nRequestId: ${requestId}`;

        await new Promise((resolve) =>
          this.signer.provider.once(
            this.airnode.filters.FulfilledRequest(null, requestId),
            resolve
          )
        );
        this.requestResults += "\nRequest Fulfilled!\n";
        this.result = await exampleClient.decodedData(requestId);
        this.requestResults += `Results: ${this.result}`;
      } catch (error) {
        console.log(error);
        // this.requestDialog = false;
      }
      this.makingRequest = false;
    },
    async makeHttpRequest() {
      try {
        this.httpRequestDialog = true;
        this.makingHttpRequest = true;
        let params = {};
        this.paramsData.forEach((p) => {
          params[p.name] = p.value;
        });
        this.httpResponse = await utils.makeGatewayRequest(
          this.receipt.api.httpGatewayUrl,
          this.endpoint.endpointId,
          params,
          this.gatewayKey
        );
        console.log(this.httpResponse);
      } catch (error) {
        console.log({ error });
        this.makeSnackbar(`Request Failed`, "error");
      }
      this.makingHttpRequest = false;
    },

    async getSponsorStatus() {
      const airnodeAdmin = require("@api3/airnode-admin");

      this.sponsorStatus = await airnodeAdmin.sponsorToRequesterToSponsorshipStatus(
        this.airnode,
        this.sponsorAddress,
        this.requestClientAddress
      );
    },
  },
};
</script>

<style scoped>
.paramTitle {
  font-size: 1.2em;
}
</style>
