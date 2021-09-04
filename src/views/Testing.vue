<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-card max-width="95%" width="90%">
        <v-form v-model="valid">
          <v-card-title>
            TESTING
          </v-card-title>
        </v-form>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      valid: false,
    };
  },
};
</script>
