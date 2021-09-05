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
                  v-if="selectedConfig"
                  color="transparent"
                  elevation="1"
                  outlined
                  height="50"
                  width="200"
                >
                  Receipt Found
                </v-sheet>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-select :items="endpointNames" v-model="selectedEndpoint" />
              </v-col>
            </v-row>
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
                <v-card>
                  <v-card-title>
                    {{ param }}
                  </v-card-title>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
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
      selectedConfig: "",
      selectedEndpoint: "",
      address: "",
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
      this.loading = true;
      this.config = await utils.getConfig(this.selectedConfig);
      this.loading = false;

      // this.receipt = await utils.getReceipt(this.selectedConfig);
    },
  },
};
</script>
