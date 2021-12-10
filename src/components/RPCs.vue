<template>
  <v-row align="center" justify="center">
    <v-col cols="12" md="7">
      <v-autocomplete
        chips
        label="Chains"
        multiple
        readonly
        :items="enabledChains"
        small-chips
        v-model="enabledChains"
      >
        <template v-slot:selection="{ attr, on, item }">
          <v-chip
            v-bind="attr"
            :color="item.url ? 'accent' : 'red'"
            small
            outlined
            v-on="on"
          >
            {{ item.name }}
          </v-chip>
        </template>
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
            <template v-for="(chain, i) of chains">
              <v-divider :key="i" />

              <v-row dense :key="i">
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
                  <v-text-field
                    v-for="(rpc, j) of chain.extraRPCs"
                    :key="j"
                    readonly
                    dense
                    v-model="chain.extraRPCs[j]"
                    :disabled="!chain.enabled"
                    :rules="[validURL(chain.url)]"
                    :loading="chain.loading"
                  ></v-text-field>
                </v-col>
              </v-row>
            </template>
          </v-sheet>
          <template v-if="!newChainForm && !newRPCForm">
            <v-btn
              dense
              width="48%"
              outlined
              text
              class="mx-2"
              @click="newRPCForm = true"
            >
              <v-icon color="primary">
                mdi-plus
              </v-icon>
              Add Provider
            </v-btn>
            <v-btn
              width="48%"
              outlined
              dense
              class="mx-2"
              text
              @click="newChainForm = true"
            >
              <v-icon color="primary">
                mdi-plus
              </v-icon>
              Create New Chain
            </v-btn>
          </template>
          <template v-else-if="newChainForm">
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
          <template v-else-if="newRPCForm">
            <v-row dense>
              <v-col cols="12" md="2">
                <v-select
                  dense
                  :items="enabledChainNames"
                  label="Chain"
                  id="chainSelect"
                  v-model="newRPC.chain"
                  outlined
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field
                  label="RPC URL"
                  dense
                  outlined
                  v-model="newRPC.RPC"
                  :rules="[validURL]"
                >
                </v-text-field>
              </v-col>

              <v-col cols="12" md="1">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" @click="newRPCForm = false">
                      <v-icon>
                        mdi-delete
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Cancel New RPC</span>
                </v-tooltip>
              </v-col>
              <v-col cols="12" md="1">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      :loading="newRPC.loading"
                      :disabled="!validNewRPC"
                      @click="saveNewRPC"
                      id="saveNewRPC"
                    >
                      <v-icon color="primary">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Add RPC</span>
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
    newRPCForm: false,
    newChain: {
      name: "",
      RPC: "",
      id: null,
      airnodeAddress: "",
      authorizersAddress: "",
      loading: false,
    },
    newRPC: {
      chain: "",
      RPC: "",
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
      dbChains.forEach((dbChain) => (dbChain.enabled = enabled));
      for (let chain of configChains) {
        const i = dbChains.findIndex((dbChain) => dbChain.id === chain.id);
        if (i > -1) {
          dbChains[i].url = chain.url;
          dbChains[i].enabled = true;
          if (chain.extraRPCs) dbChains[i].extraRPCs = chain.extraRPCs;
        } else {
          dbChains.push(chain);
        }
      }
      // Remove chains that are duplicated by name
      dbChains = dbChains.filter((dbChain) => {
        const count = dbChains.filter((c) => c.name === dbChain.name).length;
        return count === 1;
      });
      console.log({ dbChains });
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
      this.$emit("submitted");

      //   this.selectedChains = chains.map((chain) => chain.name);
      this.RPCMenu = false;
    },
    async saveNewChain() {
      if (!this.validNewChain) return;
      this.newChain.loading = true;
      console.log(this.newChain);
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
    async saveNewRPC() {
      if (!this.validNewRPC) return;
      this.newRPC.loading = true;
      const oldChain = this.chains.find(
        (chain) => chain.name === this.newRPC.chain
      );
      if (!oldChain.extraRPCs) oldChain.extraRPCs = [];
      oldChain.extraRPCs.push(this.newRPC.RPC);
      this.newRPC.loading = false;
      this.newRPCForm = false;
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

    validNewRPC() {
      const { chain, RPC } = this.newRPC;
      if (!chain || !RPC) return false;
      if (!this.validURL(RPC)) return false;
      return true;
    },
    enabledChainNames() {
      const chains = this.chains.filter((chain) => chain.enabled);
      return chains.map((chain) => chain.name);
    },
    enabledChains() {
      return this.chains.filter((chain) => chain.enabled);
    },
  },
};
</script>
