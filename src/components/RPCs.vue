<template>
  <v-row align="center" justify="center">
    <v-col cols="12" md="7">
      <v-autocomplete
        chips
        label="Chains"
        multiple
        readonly
        :items="selectedChains"
        small-chips
        v-model="selectedChains"
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
            :loading="creatingRPC"
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
      <v-card :loading="loading">
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
          <v-row v-for="(chain, i) of chains" :key="i">
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

          <v-row>
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
                v-model="newChain.chainId"
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="RPC"
                dense
                outlined
                v-model="newChain.RPC"
                :rules="[validURL]"
              >
              </v-text-field>
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
                <span>Save New Chain</span>
              </v-tooltip>
            </v-col>
          </v-row>
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
  data: () => ({
    chains: [],
    selectedChains: [],
    RPCMenu: false,
    loading: false,
    newChain: {
      name: "",
      RPC: "",
      chainId: null,
      loading: false,
    },
  }),
  methods: {
    async getChains() {
      if (this.chains.length) return;
      this.loading = true;
      const chains = await utils.getChains();
      this.chains = chains.map((chain) => {
        return {
          ...chain,
          enabled: true,
          url: "",
          loading: false,
        };
      });
      console.log(this.chains);
      this.loading = false;
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
      this.selectedChains = chains.map((chain) => chain.name);
      this.RPCMenu = false;
    },
    async saveNewChain() {
      if (!this.validNewChain) return;
      this.newChain.loading = true;
    },
    validURL(url) {
      if (!url) return true;
      let regex = /https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
      if (regex.test(url)) return true;
      else return false;
    },
  },
  computed: {
    submittable() {
      let chains = this.chains.filter((chain) => chain.enabled);
      return chains.every((chain) => this.validURL(chain.url));
    },
    validNewChain() {
      const { name, chainId, RPC } = this.newChain;
      if (!name || !chainId || !RPC) return false;
      if (!Number(chainId)) return false;
      if (!this.validURL(RPC)) return false;
      return true;
    },
  },
};
</script>
