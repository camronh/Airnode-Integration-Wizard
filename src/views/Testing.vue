<template>
  <v-container>
    <v-app-bar app color="dark" dark>
      <div class="d-flex align-center">
        <h1>
          A I W
        </h1>
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
            Please connect youre Metamask wallet
          </p>
          <v-form v-else>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  :items="configNames"
                  :loading="gettingConfigs"
                  v-model="selectedConfig"
                  @change="getConfig"
                />
              </v-col>
              <v-col cols="12" md="6" align="center" justify="center">
                <v-sheet
                  v-if="selectedConfig && receipt.title"
                  elevation="1"
                  outlined
                  color="grey darken-3"
                  height="50"
                  width="200"
                  @drop.prevent="saveReceipt($event)"
                  @dragover.prevent="dragover = true"
                  @dragenter.prevent="dragover = true"
                  @dragleave.prevent="dragover = false"
                  :class="{ accent: dragover }"
                >
                  Receipt Found!
                </v-sheet>
                <v-sheet
                  v-else-if="selectedConfig && !receipt.title"
                  elevation="1"
                  outlined
                  color="grey darken-3"
                  height="50"
                  width="200"
                  @drop.prevent="saveReceipt($event)"
                  @dragover.prevent="dragover = true"
                  @dragenter.prevent="dragover = true"
                  @dragleave.prevent="dragover = false"
                  :class="{ accent: dragover }"
                >
                  Add Receipt
                </v-sheet>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-select :items="endpointNames" v-model="selectedEndpoint" />
              </v-col>
            </v-row>
            <v-card-title>
              Params
            </v-card-title>
            <v-row>
              <v-col cols="12" md="12" align="center" justify="center">
                <v-autocomplete
                  multiple
                  chips
                  small-chips
                  deletable-chips
                  :items="paramsList"
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
                    <v-row>
                      <v-col cols="12" md="7">
                        <v-card-title class="text-no-wrap paramTitle">
                          {{ param }}
                        </v-card-title>
                      </v-col>
                      <v-col cols="12" md="5">
                        <v-select
                          :items="['bytes32', 'int256', 'bool']"
                          label="Type"
                          v-model="paramTypes[param]"
                        >
                        </v-select>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-text>
                    <v-text-field
                      label="Value"
                      outlined
                      v-model="paramValues[param]"
                    >
                    </v-text-field>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
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
              @click="openEndpoint"
              :disabled="!admin || !selectedEndpoint"
            >
              Open Endpoint Auth
            </v-btn>
            <v-btn
              class="ma-2"
              outlined
              tile
              color="primary"
              @click="makeRequest"
            >
              Make Request
            </v-btn>
          </v-card-text>
        </v-card-actions>
      </v-card>
    </v-row>
    <vue-metamask userMessage="msg" @onComplete="onComplete" />
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
  </v-container>
</template>

<script>
import VueMetamask from "vue-metamask";
import utils from "../utils/utils";

const designatedWallet = "0x8bC482471A7A7041e277Ec1D0e967b327F6633c8";

export default {
  components: {
    VueMetamask,
  },
  data() {
    return {
      valid: false,
      msg: "This is demo net work",
      connected: false,
      gettingConfigs: false,
      loading: false,
      dragover: false,
      selectedConfig: "",
      selectedEndpoint: "",
      address: "",
      paramValues: {},
      paramTypes: {},
      chainID: "",
      configNames: [],
      selectedParams: ["_path", "_type", "_times"],
      receipt: {},
      config: {},
      web3: null,
      designatedWalletBalance: 0,
    };
  },
  computed: {
    endpoints() {
      if (!this.config.id) return false;
      let endpoints = this.config.ois[0].endpoints;
      for (let endpoint of endpoints) {
        endpoint.endpointId = this.config.triggers.request.find(
          trigger => trigger.endpointName === endpoint.name
        );
      }
      return endpoints;
    },
    admin() {
      if (!this.config.id) return false;
      return (
        this.address.toLowerCase() ===
        this.config.nodeSettings.chains[0].providerAdminForRecordCreation.toLowerCase()
      );
    },
    paramsList() {
      if (!this.config.id) return;
      if (!this.selectedEndpoint) return;
      const endpoint = this.endpoints.find(
        endpoint => endpoint.name === this.selectedEndpoint
      );
      let params = endpoint.parameters.map(param => param.name);
      const reservedParams = ["_type", "_times", "_path", "_relay_metadata"];
      params.push(...reservedParams);
      return params;
    },
    airnode() {
      const airnodeProtocol = require("@api3/airnode-protocol");
      const rinkebyAirnodeAddress =
        "0xF9C39ec11055508BddA0Bc2a0234aBbbC09a3DeC";
      console.log(this.web3);
      return new this.web3.eth.Contract(
        airnodeProtocol.AirnodeArtifact.abi,
        rinkebyAirnodeAddress
      );
    },

    endpointNames() {
      if (!this.endpoints) return [];
      return this.endpoints.map(endpoint => endpoint.name);
    },
  },
  methods: {
    async onComplete(data) {
      console.log("data:", data);
      if (!data.web3) return;
      const { web3 } = data;
      this.address = data.metaMaskAddress;
      this.chainID = data.netID;
      this.web3 = web3;
      this.connected = true;
      await this.getStats();
    },
    async getBalance(address) {
      const ethers = require("ethers");
      const web3 = this.web3;
      return new Promise(resolve => {
        web3.eth.getBalance(address, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log(result.toString());
            resolve(ethers.utils.formatEther(result.toString()) + " ETH");
          }
        });
      });
    },
    async getStats() {
      this.designatedWalletBalance = await this.getBalance(designatedWallet);
      this.gettingConfigs = true;
      this.configNames = await utils.getConfigNames();
      this.gettingConfigs = false;
    },
    async getConfig() {
      this.receipt = {};
      this.config = {};
      try {
        this.loading = true;
        this.config = await utils.getConfig(this.selectedConfig);
        this.receipt = await utils.getReceipt(this.selectedConfig);
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },

    async saveReceipt(e) {
      console.log(e);
      this.dragover = false;
      try {
        let receipt = await new Promise(resolve => {
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
        if (!receipt.providerId) return console.log("Invalid Import");
        receipt.title = this.selectedConfig;
        await utils.saveReceipt(receipt);
        console.log("Saved");
      } catch (error) {
        console.log("Import Failed");
      }
    },
    async makeRequest() {
      const endpoint = this.endpoints.find(
        endpoint => endpoint.name === this.selectedEndpoint
      );
      let requestObj = {
        providerId: this.receipt.providerId,
        endpointId: endpoint.endpointId,
      };
      let params = this.selectedParams.map(param => {
        return {
          name: param,
          value: this.paramValues[param],
          type: this.paramTypes[param],
        };
      });
      requestObj.params = params;
      console.log({ requestObj });
    },
    async openEndpoint() {
      const ethers = require("ethers");

      const endpoint = this.endpoints.find(
        endpoint => endpoint.name === this.selectedEndpoint
      );
      // const airnodeAdmin = require("@api3/airnode-admin");

      const airnode = this.airnode;
      console.log(await airnode.methods);
      await airnode.methods.updateEndpointAuthorizers(
        this.receipt.providerId,
        endpoint.endpointId,
        [ethers.constants.AddressZero]
      );
      // await airnodeAdmin.updateAuthorizers(
      //   airnode,
      //   this.receipt.providerId,
      //   endpoint.endpointId,
      //   [ethers.constants.AddressZero]
      // );
      console.log({ airnode });
      // await utils.openEndpoint(this.receipt.providerId, endpoint.endpointId);
    },
  },
};
</script>

<style scoped>
.paramTitle {
  font-size: 1.2em;
}
</style>
