<template>
  <v-row align="center" justify="center">
    <v-col cols="12" md="7">
      <v-autocomplete
        chips
        label="Chains"
        multiple
        readonly
        :items="enabledChainNames"
        small-chips
        v-model="enabledChainNames"
      >
      </v-autocomplete>
    </v-col>
    <v-col cols="12" md="2">
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            block
            v-bind="attrs"
            v-on="on"
            outlined
            @click="
              RPCMenu = true;
              getChains();
            "
            color="primary"
          >
            <v-icon>
              mdi-database-cog
            </v-icon>
          </v-btn>
        </template>
        <span>Configure RPCs</span>
      </v-tooltip>
    </v-col>
    <v-dialog
      v-model="RPCMenu"
      max-width="900px"
      :overlay-opacity="15"
      persistent
      overlay-color="black"
    >
      <v-card :loading="loading" id="chainsCard">
        <v-card-title>
          Chains
          <v-spacer></v-spacer>
          <v-btn @click="RPCMenu = false" icon>
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="loading">
          Getting Chain Options...
        </v-card-text>
        <v-card-text v-else>
          <v-sheet max-height="10%">
            <v-row v-for="(chain, i) of chains" :key="i" dense>
              <v-col cols="12" md="3">
                <v-checkbox
                  v-model="chain.enabled"
                  :label="chain.name"
                  color="accent"
                ></v-checkbox>
              </v-col>
              <v-col cols="12" md="9">
                <v-text-field
                  placeholder="Input Custom RPC URL or leave blank to generate"
                  v-model="chain.url"
                  :disabled="!chain.enabled"
                  :rules="[validURL(chain.url)]"
                  :loading="chain.loading"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-sheet>

          <v-btn
            block
            dense
            outlined
            @click="newChainForm = true"
            v-if="!newChainForm"
          >
            <v-icon color="primary">
              mdi-plus
            </v-icon>
            Create New Chain
          </v-btn>
          <template v-else>
            <v-row dense>
              <v-col cols="12" md="3">
                <v-text-field
                  dense
                  label="New Chain Name"
                  v-model="newChain.name"
                  outlined
                >
                </v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  dense
                  label="ChainID"
                  outlined
                  type="number"
                  v-model="newChain.id"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12" md="7">
                <v-text-field
                  label="RPC"
                  dense
                  outlined
                  v-model="newChain.RPC"
                  :rules="[validURL]"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12" md="5">
                <v-text-field
                  label="Airnode RRP Address"
                  dense
                  :rules="[validAddress]"
                  outlined
                  v-model="newChain.airnodeAddress"
                />
              </v-col>
              <v-col cols="12" md="5">
                <v-text-field
                  label="Authorizers Address (Optional)"
                  dense
                  outlined
                  v-model="newChain.authorizersAddress"
                />
              </v-col>
              <v-col cols="12" md="1">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      @click="newChainForm = false"
                    >
                      <v-icon>
                        mdi-delete
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Cancel New Chain</span>
                </v-tooltip>
              </v-col>
              <v-col cols="12" md="1">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      :loading="newChain.loading"
                      :disabled="!validNewChain"
                      @click="saveNewChain"
                    >
                      <v-icon>
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Create New Chain</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-btn
            block
            text
            color="primary"
            @click="submitForm"
            :disabled="!submittable"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import utils from "../utils/utils";

export default {
  props: ["chains"],
  data: () => ({
    // selectedChains: [],
    // chains: [],
    RPCMenu: false,
    loading: false,
    newChainForm: false,
    newChain: {
      name: "",
      RPC: "",
      id: null,
      airnodeAddress: "",
      authorizersAddress: "",
      loading: false,
    },
  }),
  watch: {
    chains: {
      handler: function(newVal, oldVal) {
        console.log({ newVal, oldVal });
      },
    },
  },
  methods: {
    async getChains() {
      //   if (this.chains.length) return;
      this.loading = true;
      let dbChains;
      if (this.chains.length) dbChains = await utils.getChains(false);
      else dbChains = await utils.getChains();
      this.chains = this.syncChainData(this.enabledChains, dbChains);
      console.log(this.chains);
      this.loading = false;
    },
    syncChainData(configChains, dbChains, enabled = false) {
      dbChains.forEach((dbChain) => {
        dbChain.enabled = enabled;
      });
      for (let chain of configChains) {
        const i = dbChains.findIndex((dbChain) => dbChain.id === chain.id);
        if (i > -1) {
          dbChains[i].url = chain.url;
          dbChains[i].enabled = true;
        } else {
          dbChains.push(chain);
        }
      }
      return dbChains;
    },
    async submitForm() {
      let chains = this.chains.filter((chain) => chain.enabled);
      for (let chain of chains) {
        if (!chain.enabled) continue;
        if (!chain.url) {
          chain.loading = true;
          chain.url = await utils.newRPC(chain.name, chain.RPC);
          chain.loading = false;
        }
      }
      this.$emit("update:chains", chains);

      //   this.selectedChains = chains.map((chain) => chain.name);
      this.RPCMenu = false;
    },
    async saveNewChain() {
      if (!this.validNewChain) return;
      this.newChain.loading = true;
      const results = await utils.saveChain(this.newChain);
      if (results.status === 201) {
        this.chains = [];
        this.getChains();
        this.newChainForm = false;
        this.newChain = {
          name: "",
          RPC: "",
          id: null,
          airnodeAddress: "",
          authorizersAddress: "",
          loading: false,
        };
      }
      console.log({ results });
    },
    validURL(url) {
      if (!url) return true;
      let regex = /https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
      if (regex.test(url)) return true;
      else return false;
    },
    validAddress(address) {
      if (!address) return true;
      let regex = /^(0x)?[0-9a-f]{40}$/i;
      if (regex.test(address)) return true;
      else return false;
    },
  },
  computed: {
    submittable() {
      if (this.newChain.loading || this.loading) return false;
      if (this.chains.some((chain) => chain.loading)) return false;
      let chains = this.chains.filter((chain) => chain.enabled);
      return chains.every((chain) => this.validURL(chain.url));
    },
    validNewChain() {
      const { name, id, RPC, airnodeAddress } = this.newChain;
      if (!name || !id || !RPC || !airnodeAddress) return false;
      if (!Number(id)) return false;
      if (!this.validURL(RPC)) return false;
      return true;
    },
    enabledChainNames() {
      const chains = this.chains.filter((chain) => chain.enabled && chain.url);
      return chains.map((chain) => chain.name);
    },
    enabledChains() {
      return this.chains.filter((chain) => chain.enabled && chain.url);
    },
  },
};
</script>
