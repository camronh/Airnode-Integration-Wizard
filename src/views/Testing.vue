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
              <v-col cols="12" md="4">
                <v-card-text>
                  <v-select
                    :items="configNames"
                    :loading="gettingConfigs"
                    label="Config"
                    v-model="selectedConfig"
                    @change="getConfig"
                  />
                  <v-select
                    label="Endpoint"
                    :items="endpointNames"
                    v-model="selectedEndpoint"
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
                  @drop.prevent="saveReceipt($event)"
                  @dragover.prevent="dragover = true"
                  @dragenter.prevent="dragover = true"
                  @dragleave.prevent="dragover = false"
                  :class="{ accent: dragover }"
                >
                  <v-card-text>
                    <v-card-title>
                      Designated Wallet
                      <v-spacer> </v-spacer>
                      {{ designatedWalletBalance }} ETH
                    </v-card-title>
                    <v-card-subtitle align="left">
                      Address: 0x8bC482471A7A7041e277Ec1D0e967b327F6633c8
                    </v-card-subtitle>
                    <template v-if="receipt.providerId">
                      <v-card-title>
                        Receipt
                        <v-spacer> </v-spacer>
                        <v-chip color="green" small outlined>
                          <v-icon left>
                            mdi-check
                          </v-icon>
                          Receipt Found
                        </v-chip>
                      </v-card-title>
                      <v-card-subtitle align="left">
                        Master Wallet:
                        0x8bC482471A7A7041e277Ec1D0e967b327F6633c8
                      </v-card-subtitle>
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
                            :items="['bytes32', 'int256', 'bool']"
                            label="Type"
                            v-model="paramTypes[param]"
                          >
                          </v-select>
                        </v-col>
                        <v-col cols="12" md="11">
                          <v-text-field
                            label="Value"
                            outlined
                            v-model="paramValues[param]"
                          >
                          </v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
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
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
// import VueMetamask from "vue-metamask";
import utils from "../utils/utils";
// import ethers from "ethers";

const designatedWallet = "0x8bC482471A7A7041e277Ec1D0e967b327F6633c8";

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
      loading: false,
      dragover: false,
      snackbarText: "",
      snackbar: false,
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
      ethers: null,
      // web3: null,
      designatedWalletBalance: 0,
    };
  },
  async mounted() {
    try {
      const ethers = require("ethers");
      this.ethers = ethers;
      this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      this.signer = this.provider.getSigner();
      this.connected = true;
      this.address = await this.signer.getAddress();
      await this.getStats();
    } catch (error) {
      console.log(error);
    }
  },
  computed: {
    endpoints() {
      if (!this.config.id) return false;
      let endpoints = this.config.ois[0].endpoints;
      for (let endpoint of endpoints) {
        let { endpointId } = this.config.triggers.request.find(
          trigger => trigger.endpointName === endpoint.name
        );
        endpoint.endpointId = endpointId;
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
      // const ropsetAirnodeAddress = "0xF8d32C3e53F7DA6e7CB82323f2cAB2159776b832";
      const rinkebyAirnodeAddress =
        "0xF9C39ec11055508BddA0Bc2a0234aBbbC09a3DeC";
      return new this.ethers.Contract(
        rinkebyAirnodeAddress,
        airnodeProtocol.AirnodeArtifact.abi,
        this.signer
      );
    },

    endpointNames() {
      if (!this.endpoints) return [];
      return this.endpoints.map(endpoint => endpoint.name);
    },
  },
  methods: {
    makeSnackbar(message) {
      this.snackbarText = message;
      this.snackbar = true;
    },
    async getStats() {
      const balanceInWei = await this.provider.getBalance(designatedWallet);
      const balance = this.ethers.utils.formatEther(balanceInWei.toString());
      this.designatedWalletBalance = Math.round(balance * 1e4) / 1e4;

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
      this.loading = true;

      try {
        const airnodeAdmin = require("@api3/airnode-admin");

        const endpoint = this.endpoints.find(
          endpoint => endpoint.name === this.selectedEndpoint
        );
        const airnode = this.airnode;
        await airnodeAdmin.updateAuthorizers(
          airnode,
          this.receipt.providerId,
          endpoint.endpointId,
          [this.ethers.constants.AddressZero]
        );
        this.makeSnackbar(`Successfully opened Auth for '${endpoint.name}'!`);
      } catch (error) {
        this.makeSnackbar("Open Auth Failed!");
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.paramTitle {
  font-size: 1.2em;
}
</style>
