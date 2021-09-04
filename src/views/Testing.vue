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
          <p v-else>
            Connected!!
            {{ address }}
            {{ chainID }}
          </p>
        </v-card-text>
        <vue-metamask userMessage="msg" @onComplete="onComplete" />
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import VueMetamask from "vue-metamask";

export default {
  components: {
    VueMetamask,
  },
  data() {
    return {
      valid: false,
      msg: "This is demo net work",
      connected: false,
      address: "",
      chainID: "",
      web3: null,
    };
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
    },
  },
};
</script>
