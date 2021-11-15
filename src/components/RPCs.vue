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
            color="accent"
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
        </v-card-title>
        <v-card-text v-if="loading">
          Getting Chain Options...
        </v-card-text>
        <v-card-text v-else>
          {{ chainOptions }}
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import utils from "../utils/utils";

export default {
  data: () => ({
    chainOptions: [],
    selectedChains: [],
    RPCMenu: false,
    loading: false,
  }),
  methods: {
    async getChains() {
      this.loading = true;
      const chains = await utils.getChains();
      this.chainOptions = chains;
      this.loading = false;
    },
  },
};
</script>
