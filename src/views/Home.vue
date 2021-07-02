<template>
  <v-container>
    <v-card>
      <v-card-title>
        Swagger Maker
      </v-card-title>
      <v-card-subtitle>
        Fill out the fields below to generate a Swagger file
      </v-card-subtitle>
      <v-divider></v-divider>
      <v-form v-model="valid">
        <v-card-title>
          <v-text-field placeholder="Title" v-model="title"></v-text-field>
        </v-card-title>
        <v-container>
          <v-row align="center" justify="center">
            <v-col cols="12" md="4">
              <v-text-field v-model="version" label="Version"></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="server"
                label="Server"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6" md="1">
              <v-checkbox label="Auth" v-model="hasAuth"> </v-checkbox>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="auth.type"
                :disabled="!hasAuth"
                label="Type"
                :items="['apiKey']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                :disabled="!hasAuth"
                v-model="auth.in"
                label="In"
                :items="['query']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                :disabled="!hasAuth"
                v-model="auth.name"
                label="Name"
                placeholder="X-API-KEY"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-card-title>
            Endpoints
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="endpoint of endpoints"
                :key="endpoint.name"
              ></v-list-item>
            </v-list>
            <v-card>
              <v-row align="center" justify="center">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="ep.path"
                    label="Path"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="ep.method"
                    label="Method"
                    :items="['GET', 'POST']"
                    required
                  ></v-select>
                </v-col>
              </v-row>
              <v-card-subtitle>
                Params
              </v-card-subtitle>
              <v-row align="center" justify="center">
                <v-list>
                  <v-list-item v-for="p of ep.params" :key="p.name">
                    <v-list-item-title>
                      {{ p.name }} - {{ p.method }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="param.name"
                    label="Name"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="param.in"
                    label="In"
                    :items="['query', 'header', 'path', 'cookie']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" md="1">
                  <v-btn icon>
                    <v-icon>
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn>
                  Add Endpoint
                </v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-card-text>
        </v-container>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      title: "",
      version: "",
      server: "",
      hasAuth: true,
      auth: {
        type: "apiKey",
        in: "query",
        name: "",
      },
      ep: {
        name: "",
        path: "",
        method: "GET",
        params: [],
      },
      param: {
        name: "",
        in: "query",
      },
      endpoints: [],
    };
  },

  components: {},
};
</script>
