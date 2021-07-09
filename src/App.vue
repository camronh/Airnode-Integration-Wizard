<template>
  <v-app>
    <v-app-bar app color="dark" dark>
      <div class="d-flex align-center">
        <h1>
          A I T
        </h1>
      </div>
      <v-spacer></v-spacer>
      <!-- <v-btn icon color="primary" @click="infoDialog = true">
        <v-icon>
          mdi-information-outline
        </v-icon>
      </v-btn> -->
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
    <v-dialog v-model="infoDialog">
      <v-card>
        <v-card-title>
          Airnode Integrations
        </v-card-title>
        <v-card-subtitle>
          Generate Swagger/OpenAPI Specs quickly and easily from API Documents
        </v-card-subtitle>
        <v-card-text>
          <v-divider></v-divider>

          To get started, open up the
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    infoDialog: false,
    //
  }),
};
</script>
