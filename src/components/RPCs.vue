<template>
  <v-row align="center" justify="center">
    <v-col cols="12" md="7">
      <v-autocomplete
        chips
        label="Chains"
        multiple
        readonly
        :items="chainOptions"
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
    <v-dialog v-model="RPCMenu" max-width="900px">
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
                :disabled="!chain.enabled"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn block text color="primary">
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
  }),
  methods: {
    async getChains() {
      this.loading = true;
      const chains = await utils.getChains();
      this.chains = chains.map((chain) => {
        return {
          name: chain,
          enabled: true,
          url: "",
        };
      });
      this.loading = false;
    },
  },
};
</script>
