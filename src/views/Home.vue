<template>
  <v-container>
    <v-app-bar app color="dark" dark>
      <div class="d-flex align-center">
        <h1>
          A I W
        </h1>
      </div>
      <v-spacer></v-spacer>
      <!-- <v-btn icon color="primary" @click="infoDialog = true">
        <v-icon>
          mdi-information-outline
        </v-icon>
      </v-btn> -->
    </v-app-bar>
    <br />
    <v-row align="center" justify="center">
      <v-card max-width="95%" width="90%">
        <v-form v-model="valid">
          <v-card-title>
            API Settings
            <v-spacer></v-spacer>
            <!-- <v-btn text @click="importing = true" color="primary" icon>
              <v-icon>
                mdi-import
              </v-icon>
            </v-btn>
            <v-btn
              @click="exportConfig"
              text
              icon
              color="primary"
            >
              <v-icon>
                mdi-export
              </v-icon>
            </v-btn> -->
            <v-menu bottom left v-if="!selectingEndpoint">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" id="menuButton">
                  <v-icon>
                    mdi-dots-vertical
                  </v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item-group>
                  <v-list-item id="import" @click="importing = true">
                    <v-list-item-title
                      >Import
                      <v-icon right>
                        mdi-import
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :disabled="!valid || !endpoints.length"
                    @click="exportConfig"
                    id="export"
                  >
                    <v-list-item-title>
                      Export
                      <v-icon right :disabled="!valid || !endpoints.length">
                        mdi-export
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :disabled="!endpoints.length"
                    id="cloneEndpoint"
                    @click="selectingEndpoint = true"
                  >
                    <v-list-item-title>Clone Endpoint</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    id="bulkChange"
                    @click="openBulkMenu"
                    :disabled="!endpoints.length"
                  >
                    <v-list-item-title>Bulk Change</v-list-item-title>
                  </v-list-item>
                  <v-list-item id="addAuth" @click="addedExtraAuth = true">
                    <v-list-item-title>Add Auth</v-list-item-title>
                  </v-list-item>
                  <v-list-item id="clear" @click="confirmClear = true">
                    <v-list-item-title>Clear Session</v-list-item-title>
                  </v-list-item>
                  <v-list-item id="testing" to="/Testing">
                    <v-list-item-title>Testing Suite</v-list-item-title>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-menu>
            <v-btn icon v-else @click="selectingEndpoint = false">
              <v-icon>
                mdi-close
              </v-icon>
            </v-btn>
          </v-card-title>
          <v-card-title>
            <v-spacer></v-spacer>
            <v-text-field
              placeholder="Title"
              v-model="title"
              type="text"
              @input="storeSession"
              pattern="[a-zA-Z]+"
              class="titleField ma-1"
              :rules="[required]"
              height="40px"
            ></v-text-field>
            <v-spacer></v-spacer>
          </v-card-title>
          <v-container>
            <v-row align="center" justify="center">
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="server"
                  placeholder="https://api.website.com/v2"
                  label="Server"
                  @input="storeSession"
                  :rules="serverRules"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="version"
                  label="Version"
                  required
                  @input="storeSession"
                  :rules="required"
                ></v-text-field>
              </v-col>
            </v-row>
            <RPCs :currentChains.sync="chains" @submitted="storeSession" />
            <!-- <v-row align="center" justify="center">
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="RPCs[0]"
                  placeholder="https://rinkeby.infura.io/v3/{ FILL }"
                  label="RPC URL"
                  :disabled="creatingRPC"
                  :rules="serverRules"
                  id="rpcURL"
                  @input="storeSession"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      block
                      @click="confirmCreateRPC = true"
                      v-bind="attrs"
                      v-on="on"
                      :loading="creatingRPC"
                    >
                      <v-icon>
                        mdi-database-refresh
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Generate RPC Url</span>
                </v-tooltip>
              </v-col>
            </v-row> -->

            <v-row align="center" justify="center">
              <v-col cols="12" md="3">
                <v-checkbox
                  label="Auth"
                  v-model="hasAuth"
                  @change="storeSession"
                >
                </v-checkbox>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="auth.type"
                  :disabled="!hasAuth"
                  label="Type"
                  @input="storeSession"
                  :items="['apiKey', 'http']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  :disabled="!hasAuth"
                  v-model="auth.in"
                  label="In"
                  @input="storeSession"
                  :items="['query', 'header']"
                  required
                ></v-select>
              </v-col>
            </v-row>
            <v-row align="center" justify="center">
              <v-col cols="12" md="3">
                <v-text-field
                  v-if="auth.type == 'apiKey'"
                  :disabled="!hasAuth"
                  v-model="auth.name"
                  label="Name"
                  @input="storeSession"
                  placeholder="X-API-KEY"
                  :rules="hasAuth ? required : false"
                  required
                ></v-text-field>
                <v-select
                  v-else
                  :disabled="!hasAuth"
                  v-model="auth.scheme"
                  label="Scheme"
                  :error="auth.type == 'http' && !auth.scheme"
                  @input="storeSession"
                  :items="['basic', 'bearer']"
                  required
                  item-value="basic"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :disabled="!hasAuth"
                  v-model="auth.value"
                  label="Value"
                  id="authValue"
                  @input="storeSession"
                  placeholder="XXXAPI_KEYXXX (Leave blank if N/A)"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <template v-if="addedExtraAuth">
              <v-row align="center" justify="center">
                <v-col cols="12" md="3">
                  <v-select
                    v-model="extraAuth.type"
                    :disabled="!hasAuth"
                    label="Type"
                    @input="storeSession"
                    :items="['apiKey', 'http']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    :disabled="!hasAuth"
                    v-model="extraAuth.in"
                    label="In"
                    @input="storeSession"
                    :items="['query', 'header']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" md="3">
                  <v-btn
                    block
                    text
                    @click="addedExtraAuth = false"
                    id="trashAuthBtn"
                  >
                    <v-icon>
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row align="center" justify="center">
                <v-col cols="12" md="3">
                  <v-text-field
                    v-if="extraAuth.type == 'apiKey'"
                    :disabled="!hasAuth"
                    v-model="extraAuth.name"
                    label="Name"
                    @input="storeSession"
                    placeholder="X-API-KEY"
                    :rules="hasAuth ? required : false"
                    autofocus
                    required
                  ></v-text-field>
                  <v-select
                    v-else
                    :disabled="!hasAuth"
                    v-model="extraAuth.scheme"
                    label="Scheme"
                    :items="['basic', 'bearer']"
                    required
                    :error="extraAuth.type == 'http' && !extraAuth.scheme"
                    @input="storeSession"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :disabled="!hasAuth"
                    v-model="extraAuth.value"
                    label="Value"
                    @input="storeSession"
                    placeholder="XXXAPI_KEYXXX (Leave blank if N/A)"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </template>
            <v-row align="center" justify="center">
              <v-col cols="12" md="1"></v-col>
              <v-col cols="12" md="11">
                <v-card-title>
                  Endpoints ({{ endpoints.length }})
                </v-card-title>
                <v-card-text>
                  <template v-if="!selectingEndpoint">
                    <v-chip
                      v-for="(endpoint, i) of endpoints"
                      :key="i"
                      close
                      class="ma-1"
                      outlined
                      :color="validEndpoint(endpoint) ? '' : 'red'"
                      label
                      @click="editEndpoint(i)"
                      @click:close="deleteEndpoint(i)"
                    >
                      {{ endpoint.path }} - {{ endpoint.method }}
                    </v-chip>
                    <v-chip
                      outlined
                      label
                      color="primary"
                      @click="newEndpoint"
                      class="ma-1"
                    >
                      <v-icon left>mdi-plus</v-icon>
                      Add Endpoint
                    </v-chip>
                  </template>
                  <template v-else>
                    <v-btn
                      v-for="(endpoint, i) of endpoints"
                      :key="i"
                      class="ma-1"
                      @click="cloneEndpoint(endpoint)"
                    >
                      {{ endpoint.path }} - {{ endpoint.method }}
                    </v-btn>
                  </template>
                  <br />
                </v-card-text>
              </v-col>
            </v-row>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-row>
    <v-dialog
      v-model="endpointMenu"
      max-width="60%"
      :overlay-opacity="75"
      persistent
      overlay-color="black"
    >
      <v-card>
        <v-card-title>
          {{ editing ? "Edit" : "New" }} Endpoint
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>

          <v-btn @click="endpointMenu = false" icon>
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="7">
              <v-text-field
                v-model="ep.path"
                label="Path"
                id="path"
                autofocus
                @keypress.enter="saveEndpoint"
                @input="parsePath"
                placeholder="/endpoint/{pathParam}"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="ep.method"
                label="Method"
                :items="['get', 'post']"
                required
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <br />
        <v-card-text>
          <v-row>
            <v-col cols="12" md="12">
              <v-card height="100%" flat>
                <v-card-title>
                  Params
                </v-card-title>

                <v-card-text>
                  <v-row align="center">
                    <v-col cols="12" md="7">
                      <v-text-field
                        v-model="param.name"
                        label="Param Name"
                        id="paramName"
                        placeholder="ex. currency"
                        @keypress.enter="addParam"
                        ref="paramName"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-select
                        v-model="param.in"
                        label="In"
                        :items="paramTypes"
                        required
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="1">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            icon
                            @click="addParam"
                            color="primary"
                            :disabled="
                              !param.name || (param.fixed && !param.value)
                            "
                            v-bind="attrs"
                            v-on="on"
                          >
                            <v-icon>
                              mdi-plus
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>Add Param</span>
                      </v-tooltip>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-checkbox label="Fixed" v-model="param.fixed">
                      </v-checkbox>
                    </v-col>
                    <v-col cols="12" md="9">
                      <v-text-field
                        label="Value"
                        :disabled="!param.fixed"
                        v-model="param.value"
                        @keypress.enter="addParam"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text>
          <template v-if="ep.params.length">
            <v-chip
              v-for="(p, i) of ep.params"
              :key="p.name"
              close
              label
              :color="p.fixed ? 'accent' : ''"
              class="ma-1"
              outlined
              @click="editParam(p, i)"
              @click:close="deleteParam(i)"
            >
              {{ p.name }} - {{ p.in }}
            </v-chip>
          </template>
          <p v-else>
            No params...
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="saveEndpoint"
            :disabled="!savableEndpoint"
            text
            id="saveEndpoint"
            type="submit"
            color="primary"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

    <v-dialog v-model="mergingDialog" width="300">
      <v-card height="100%">
        <v-card-title>
          {{ mergeProgress != 100 ? "Merging Configs..." : "Merge Complete" }}
        </v-card-title>
        <v-card-text>
          <v-progress-linear
            color="primary"
            class="mb-0"
            :value="mergeProgress"
          ></v-progress-linear>
        </v-card-text>

        <v-card-text>
          <ul>
            <li v-for="name of mergeConfigsNames" :key="name">
              {{ name }}
            </li>
          </ul>
          <v-card-actions>
            <v-row>
              <v-col cols="12" md="6">
                <v-btn
                  @click="
                    exporting = true;
                    mergingDialog = false;
                  "
                  text
                  block
                >
                  <v-icon>
                    mdi-magnify
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn
                  @click="
                    downloadOptions = ['Deployment'];
                    download();
                  "
                  text
                  block
                >
                  <v-icon>
                    mdi-download
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="importing" max-width="50%">
      <v-card class="overflow-hidden">
        <v-app-bar flat color="transparent">
          <v-row>
            <v-col cols="12" md="5">
              <v-tabs v-model="tab" fixed-tabs>
                <v-tabs-slider color="accent"></v-tabs-slider>
                <v-tab>
                  Import
                </v-tab>
                <v-tab @click="getConfigNames">
                  Saved
                </v-tab>
              </v-tabs>
            </v-col>
            <v-col cols="12" md="1"> </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-if="tab == 1"
                prepend-icon="mdi-magnify"
                @keypress.enter="importOnlyConfig"
                v-model="configSearch"
                autofocus
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-app-bar>

        <v-tabs-items v-model="tab">
          <v-tab-item>
            <template>
              <v-card-title>
                Import API Specs

                <!-- <v-btn-toggle
            v-model="importType"
            tile
            color="primary"
            group
            @change="parseImport"
          >
            <v-btn value="OAS">
              OAS / Swagger
            </v-btn>
            <v-btn value=".Config">
              Config
            </v-btn>
          </v-btn-toggle> -->
              </v-card-title>
              <v-card-subtitle>
                Paste or Drop an API Spec (OAS/Swagger/Config)
              </v-card-subtitle>

              <v-card-text
                @drop.prevent="onDrop($event)"
                @dragover.prevent="dragover = true"
                @dragenter.prevent="dragover = true"
                @dragleave.prevent="dragover = false"
                :class="{ accent: dragover }"
              >
                <v-textarea
                  v-model="importString"
                  rows="16"
                  autofocus
                  placeholder='{ "swagger": "2.0", "info": { "version": "1.0.0" } }'
                  @input="parseImport"
                  no-resize
                  dense
                  :error="importError"
                >
                </v-textarea>
                <v-btn
                  @click="importing = false"
                  :disabled="importError"
                  text
                  color="primary"
                  type="submit"
                  block
                >
                  Import
                  <v-icon right>
                    mdi-import
                  </v-icon>
                </v-btn>
              </v-card-text>
            </template>
          </v-tab-item>
          <v-tab-item>
            <v-card-text>
              <v-list
                style="max-height: 600px"
                class="overflow-y-auto"
                v-if="!mergingConfigs"
              >
                <v-list-item-group
                  v-model="selectedConfig"
                  mandatory
                  color="accent"
                >
                  <template>
                    <v-hover
                      v-slot="{ hover }"
                      v-for="(configName, i) in searchedConfigs"
                      :key="i"
                    >
                      <v-list-item @dblclick="importSavedConfig()">
                        <v-list-item-content>
                          <v-list-item-title
                            v-text="configName"
                          ></v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action v-if="hover || selectedConfig == i">
                          <v-btn icon @click="deleteConfig(configName)" small>
                            <v-icon color="red" small>
                              mdi-close
                            </v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </v-hover>
                  </template>
                </v-list-item-group>
              </v-list>
              <v-list style="max-height: 600px" class="overflow-y-auto" v-else>
                <v-list-item-group
                  v-model="selectedConfigs"
                  multiple
                  color="accent"
                >
                  <template>
                    <v-list-item
                      v-for="configName in savedConfigNames"
                      :key="configName"
                      v-show="found(configName)"
                    >
                      <v-list-item-content>
                        <v-list-item-title
                          v-text="configName"
                        ></v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-list-item-group>
              </v-list>
            </v-card-text>

            <v-tooltip left v-if="!mergingConfigs">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fixed
                  right
                  style="bottom:64px"
                  bottom
                  v-bind="attrs"
                  v-on="on"
                  @click="mergingConfigs = true"
                >
                  <v-icon>
                    mdi-merge
                  </v-icon>
                </v-btn>
              </template>
              <span>Merge Configs</span>
            </v-tooltip>
            <v-tooltip left v-else>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fixed
                  right
                  style="bottom:64px"
                  bottom
                  :disabled="selectedConfigs.length < 2"
                  v-bind="attrs"
                  v-on="on"
                  @click="mergeConfigs"
                >
                  <v-icon>
                    mdi-merge
                  </v-icon>
                </v-btn>
              </template>
              <span>Merge!</span>
            </v-tooltip>
            <v-tooltip left v-if="!mergingConfigs">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fixed
                  right
                  bottom
                  v-bind="attrs"
                  v-on="on"
                  @click="exportAllOIS"
                >
                  <v-icon>
                    mdi-database-export-outline
                  </v-icon>
                </v-btn>
              </template>
              <span>Export All OIS's</span>
            </v-tooltip>
            <v-tooltip left v-else>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fixed
                  right
                  bottom
                  v-bind="attrs"
                  v-on="on"
                  @click="
                    mergingConfigs = false;
                    selectedConfigs = [];
                  "
                >
                  <v-icon>
                    mdi-close
                  </v-icon>
                </v-btn>
              </template>
              <span>Cancel Merge</span>
            </v-tooltip>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmCreateRPC" max-width="400px">
      <v-card class="overflow-hidden">
        <v-card-title>
          Create RPC
        </v-card-title>
        <v-card-subtitle>
          Are you sure you want to generate a new RPC URL?
        </v-card-subtitle>
        <v-card-actions>
          <v-row>
            <v-col cols="12" md="6">
              <v-btn @click="confirmCreateRPC = false" block text color="white">
                Cancel
              </v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn @click="createRPC()" text block color="primary">
                Create
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="bulkMenu"
      max-width="50%"
      fullscreen
      :overlay-opacity="75"
      :scrollable="false"
    >
      <v-card>
        <v-card-title>
          Bulk Changes
          <v-spacer></v-spacer>
          <v-btn icon @click="bulkMenu = false">
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle>
          Make changes to multiple endpoints at once
        </v-card-subtitle>
        <v-card-text>
          <v-card-title>
            Endpoints
            <v-spacer></v-spacer>
            <v-card-subtitle>
              <a
                v-if="selectedEndpoints.length == endpoints.length"
                @click="selectedEndpoints = []"
              >
                Deselect All
              </a>
              <a v-else @click="openBulkMenu">
                Select All
              </a>
            </v-card-subtitle>
          </v-card-title>
          <v-row>
            <v-col cols="12" md="12">
              <v-chip-group
                multiple
                column
                active-class="primary--text"
                v-model="selectedEndpoints"
              >
                <v-chip v-for="(endpoint, i) in endpoints" :key="i">
                  {{ endpoint.path }} - {{ endpoint.method }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text>
          <v-card-title>
            Params
          </v-card-title>
          <v-row>
            <v-col cols="12" md="12">
              <v-chip-group
                active-class="primary--text"
                v-model="selectedParam"
                column
              >
                <v-chip
                  v-for="(param, i) in selectedEndpointParams"
                  outlined
                  :key="i"
                >
                  {{ param.name }} - {{ param.in }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-row align="center" justify="center">
            <v-col cols="12" md="4">
              <v-btn block text @click="bulkAddParamMenu = true">
                Add Param
              </v-btn>
            </v-col>
            <v-col cols="12" md="4">
              <v-btn block text @click="confirmDelete = true">
                Del Param
              </v-btn>
            </v-col>
            <v-col cols="12" md="4">
              <v-btn block text @click="openBulkEditMenu">
                Edit Param
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="exporting" max-width="70%" :overlay-opacity="75">
      <v-card color="grey darken-3">
        <v-card-title>
          Export
          <v-spacer></v-spacer>
          <v-btn
            icon
            :loading="savingConfig"
            @click="saveConfig"
            v-if="!mergingConfigs"
          >
            <v-icon>
              mdi-floppy
            </v-icon>
          </v-btn>
          <v-btn
            icon
            @click="
              exporting = false;
              mergingDialog = true;
            "
            v-else
          >
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle>
          Edit your config.json
        </v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="9">
              <v-jsoneditor
                v-model="exportJson"
                :plus="true"
                @error="importError = true"
                height="600px"
                :options="options"
              >
              </v-jsoneditor>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                label="Cloud Provider"
                v-model="exportSettings.cloudProvider"
                @change="exportConfig()"
                :items="['aws', 'local']"
              ></v-select>
              <v-checkbox
                label="Authorizers"
                @change="exportConfig()"
                v-model="exportSettings.authorizers"
              ></v-checkbox>
              <v-checkbox
                label="Heartbeat"
                v-model="exportSettings.heartbeat"
                disabled
              ></v-checkbox>
              <v-select
                @change="exportConfig()"
                label="Stage"
                v-model="exportSettings.stage"
                :items="['dev', 'prod']"
              ></v-select>
              <v-btn block outlined color="primary" @click="secretsMenu = true">
                <v-icon>
                  mdi-magnify
                </v-icon>
                Secrets.env
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <v-btn
          block
          @click="downloading = true"
          text
          color="primary"
          v-if="!mergingConfigs"
        >
          Download
        </v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="bulkAddParamMenu" max-width="50%">
      <v-card>
        <v-card-title>
          Add Param to {{ selectedEndpoints.length }} Endpoints
        </v-card-title>

        <v-card-text>
          <v-row align="center">
            <v-col cols="12" md="7">
              <v-text-field
                v-model="param.name"
                label="Param Name"
                placeholder="ex. currency"
                ref="paramName"
                autofocus
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
            <v-col cols="12" md="3">
              <v-checkbox label="Fixed" v-model="param.fixed"> </v-checkbox>
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field
                label="Value"
                :disabled="!param.fixed"
                v-model="param.value"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn block text color="primary" @click="bulkAddParam">
            Bulk Add Param
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="bulkEditParamMenu" max-width="50%">
      <v-card>
        <v-card-title>
          Edit Param in {{ selectedEndpoints.length }} Endpoints
        </v-card-title>

        <v-card-text>
          <v-row align="center">
            <v-col cols="12" md="7">
              <v-text-field
                v-model="param.name"
                label="Param Name"
                id="paramName"
                placeholder="ex. currency"
                ref="paramName"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="param.in"
                label="In"
                id="bulkEditIn"
                :items="['query', 'header', 'path', 'cookie']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-checkbox label="Fixed" v-model="param.fixed"> </v-checkbox>
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field
                label="Value"
                :disabled="!param.fixed"
                v-model="param.value"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn block text color="primary" @click="bulkEditParam">
            Bulk Edit Param
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmDelete" max-width="30%">
      <v-card>
        <v-card-title>
          Delete Param from {{ selectedEndpoints.length }} Endpoints
        </v-card-title>

        <v-card-actions>
          <v-row justify="center" align="center">
            <v-btn text color="red" @click="bulkDeleteParam">
              Delete
            </v-btn>

            <v-btn text color="primary" @click="confirmDelete = false">
              Cancel
            </v-btn>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="downloading" max-width="400px">
      <v-card>
        <v-card-title>
          Download Options
        </v-card-title>
        <v-card-text>
          <v-row align="center" justify="center">
            <v-col cols="12" md="5">
              <v-checkbox
                label="OAS"
                v-model="downloadOptions"
                value="OAS"
              ></v-checkbox>
              <v-checkbox
                label="OIS"
                v-model="downloadOptions"
                value="OIS"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox
                label="Readme.md"
                v-model="downloadOptions"
                value="Readme"
              ></v-checkbox>
              <v-checkbox
                label="Deployment Pkg"
                v-model="downloadOptions"
                value="Deployment"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-btn
            text
            block
            @click="download"
            :disabled="!downloadOptions.length"
          >
            <v-icon>
              mdi-download
            </v-icon>
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmClear" max-width="400px" max-height="1000px">
      <v-card height="100%">
        <v-card-title>
          Are you sure you want to clear data?
        </v-card-title>
        <v-card-text>
          <v-row align="center" justify="center">
            <v-checkbox
              label="Store Sessions"
              v-model="storeSessions"
            ></v-checkbox>
          </v-row>
        </v-card-text>
        <v-card-text>
          <v-row justify="center" align="center">
            <v-btn text @click="confirmClear = false">
              Close
            </v-btn>
            <v-btn text color="red" @click="clear">
              Clear All
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="secretsMenu" max-width="1100px">
      <v-card>
        <v-card-title>
          Secrets.env
          <v-spacer></v-spacer>
          <v-icon @click="secretsMenu = false">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-textarea
            :value="secretsStr"
            readonly
            auto-grow
            id="secretsTextArea"
          >
          </v-textarea>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
import utils from "../utils/utils";
import VJsoneditor from "v-jsoneditor/src/index";
import yaml from "yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import RPCs from "../components/RPCs.vue";
import { v4 as uuid } from "uuid";

export default {
  name: "Home",
  components: {
    VJsoneditor,
    RPCs,
  },
  data() {
    return {
      title: "",
      version: "",
      server: "",
      importString: "",
      dragover: false,
      tab: null,
      exportStr: "{}",
      selectedEndpoints: [],
      valid: false,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      secretsStr: "",
      configSearch: "",
      options: {
        mode: "code",
        enableTransform: false,
      },
      chains: [],
      RPCs: [""],
      addedExtraAuth: false,
      importError: false,
      importing: false,
      savedConfigNames: [],
      exportType: "oas",
      exporting: false,
      gatewayKey: "",
      exportSettings: {
        cloudProvider: "aws",
        authorizers: false,
        heartbeat: false,
        stage: "dev",
      },
      selectedConfig: null,
      selectedConfigs: [],
      storeSessions: localStorage.storeSessions === "false" ? false : true,
      confirmClear: false,
      confirmCreateRPC: false,
      savingConfig: false,
      selectingEndpoint: false,
      confirmDelete: false,
      mergingConfigs: false,
      mergingDialog: false,
      mergeConfigsNames: [],
      mergeProgress: 0,
      selectedParam: null,
      downloading: false,
      loading: false,
      creatingRPC: false,
      editing: false,
      paramTypes: ["query", "header", "path", "cookie"],
      downloadOptions: ["OAS", "OIS", "Readme", "Deployment"],
      exportJson: {},
      editingConfig: false,
      bulkEditParamMenu: false,
      endpointMenu: false,
      bulkMenu: false,
      bulkAddParamMenu: false,
      secretsMenu: false,
      hasAuth: true,
      auth: {
        type: "apiKey",
        in: "query",
        name: "",
        value: "",
        scheme: null,
      },
      extraAuth: {
        type: "apiKey",
        in: "query",
        name: "",
        value: "",
        scheme: null,
      },
      oas: "",
      endpoints: [],
      ep: {
        path: "",
        method: "get",
        params: [],
      },
      rp: {
        type: "int256",
        path: "",
        times: false,
      },
      oldParam: {},
      param: {
        name: "",
        in: "query",
        fixed: false,
        value: "",
      },
      required: [v => !!v || "Required"],
      serverRules: [
        v => !!v || "Required",
        v => v.includes("://") || "Invalid Server",
      ],
    };
  },
  watch: {
    async exportJson() {
      console.log("Changed");
      this.exportStr = JSON.stringify(this.exportJson, null, 2);
      this.importString = this.exportStr;
      const chains = this.chains;
      await this.parseImport();
      this.chains = chains;
    },

    storeSessions() {
      localStorage.storeSessions = this.storeSessions;
    },
    chains() {
      this.storeSession();
    },
  },
  mounted() {
    // localStorage.clear();
    try {
      if (localStorage.session) {
        let session = JSON.parse(localStorage.session);
        if (
          !localStorage.storeSessions ||
          localStorage.storeSessions === "false"
        )
          return;
        this.server = session.server;
        this.title = session.title;
        this.version = session.version;
        this.hasAuth = session.hasAuth;
        this.addedExtraAuth = session.addedExtraAuth;
        this.chains = session.chains;
        this.auth = session.auth;
        this.gatewayKey = session.gatewayKey;
        this.extraAuth = session.extraAuth;
        this.endpoints = session.endpoints;
      }
    } catch (error) {
      console.log(error);
    }
  },
  methods: {
    saveEndpoint() {
      // this.ep.reservedParam = this.rp;
      // if endpoint.path exists in endpoints get index
      const duplicateIndex = this.endpoints.findIndex(
        v => v.path === this.ep.path && v.method === this.ep.method
      );
      console.log({ duplicateIndex });
      if (duplicateIndex > -1) this.endpoints[duplicateIndex] = this.ep;
      else if (!this.editing) this.endpoints.push(this.ep);
      else this.endpoints[this.editIndex] = this.ep;
      this.ep = {
        path: "",
        method: "get",
        params: [],
      };
      this.endpointMenu = false;
      this.storeSession();
    },
    found(name) {
      return this.searchedConfigs.includes(name);
    },
    addParam() {
      if (!this.param.name || (this.param.fixed && !this.param.value)) return;

      // Remove whitespaces from param.name
      this.param.name = this.param.name.replace(/ /g, "");

      // Check if param already exists in this.ep.params
      const duplicateIndex = this.ep.params.findIndex(
        v => v.name === this.param.name && v.in === this.param.in
      );
      if (duplicateIndex > -1) {
        this.param = { name: "", in: "query", fixed: false, value: "" };
        return;
      }
      this.ep.params.push(this.param);
      this.param = { name: "", in: "query", fixed: false, value: "" };
      // sort this.ep.params by name
      this.ep.params.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      this.$refs.paramName.focus();
    },
    editParam(param, index) {
      if (this.param.name || this.param.value) return;
      this.param = param;
      this.ep.params.splice(index, 1);
    },

    download() {
      utils.makeZip(this);
    },

    deleteParam(i) {
      this.ep.params.splice(i, 1);
    },
    editEndpoint(i) {
      this.ep = this.endpoints[i];
      this.editIndex = i;
      // if (!this.ep.reservedParam) {
      //   console.log("No reserved param");
      //   console.log(this.ep);
      //   this.rp = {
      //     type: "int256",
      //     path: "",
      //     times: false,
      //   };
      // } else this.rp = this.ep.reservedParam;
      this.editing = true;
      this.endpointMenu = true;
    },
    clearEndpoint() {
      this.ep = {
        path: "",
        method: "get",
        params: [],
      };
    },
    openBulkMenu() {
      const indexs = this.endpoints.map((v, i) => i);
      this.param = { name: "", in: "query", fixed: false, value: "" };
      this.selectedEndpoints = indexs;
      this.bulkMenu = true;
    },
    openBulkEditMenu() {
      this.param = this.selectedEndpointParams[this.selectedParam];
      this.oldParam = { ...this.param };
      this.bulkEditParamMenu = true;
    },
    bulkAddParam() {
      // Remove whitespace from this.param.name
      this.param.name = this.param.name.replace(/ /g, "");
      let param = JSON.parse(JSON.stringify(this.param));

      for (let i of this.selectedEndpoints) {
        this.endpoints[i].params.push(param);
      }
      this.param = { name: "", in: "query", fixed: false, value: "" };
      this.bulkAddParamMenu = false;
    },
    bulkDeleteParam() {
      let endpoints = [];
      const paramToDel = this.selectedEndpointParams[this.selectedParam];
      console.log({ paramToDel });
      for (let index = 0; index < this.endpoints.length; index++) {
        if (!this.selectedEndpoints.includes(index)) {
          endpoints.push(this.endpoints[index]);
          continue;
        }
        const endpoint = this.endpoints[index];
        // delete paramToDel from endpoint.params
        const indexOfParam = endpoint.params.findIndex(
          v => v.name === paramToDel.name && v.in === paramToDel.in
        );
        if (indexOfParam > -1) {
          endpoint.params.splice(indexOfParam, 1);
        }
        endpoints.push(endpoint);
      }
      this.endpoints = endpoints;
      this.confirmDelete = false;
    },
    makeSnackbar(message) {
      this.snackbarText = message;
      this.snackbar = true;
    },

    bulkEditParam() {
      let endpoints = [];
      const paramToEdit = this.oldParam;
      console.log({ paramToEdit });
      for (let index = 0; index < this.endpoints.length; index++) {
        if (!this.endpoints[index]) continue;
        if (!this.selectedEndpoints.includes(index)) {
          endpoints.push(this.endpoints[index]);
          continue;
        }
        const endpoint = this.endpoints[index];
        const indexOfParam = endpoint.params.findIndex(
          v => v.name === paramToEdit.name && v.in === paramToEdit.in
        );
        if (indexOfParam > -1) {
          endpoint.params[indexOfParam] = this.param;
        }
        endpoints.push(endpoint);
      }
      this.endpoints = endpoints;
      this.bulkEditParamMenu = false;
    },

    deleteEndpoint(i) {
      console.log(this.endpoints);
      this.endpoints.splice(i, 1);
      console.log(this.endpoints);
    },
    newEndpoint() {
      this.ep = {
        path: "",
        method: "get",
        params: [],
        // reservedParam: {
        //   type: "int256",
        //   path: "",
        //   times: false,
        // },
      };
      // this.rp = this.ep.reservedParam;
      this.editing = false;
      this.endpointMenu = true;
    },
    cloneEndpoint(endpoint) {
      let deepClone = JSON.parse(JSON.stringify(endpoint));

      this.ep = deepClone;

      // this.rp = this.ep.reservedParam;
      this.editing = false;
      this.endpointMenu = true;
      this.selectingEndpoint = false;
    },
    exportConfig() {
      this.mergingConfigs = false;
      if (!this.gatewayKey) this.gatewayKey = uuid();
      // const chains = this.chains;
      this.oas = utils.makeOAS(this);
      this.exportStr = utils.makeConfig(this);
      console.log(this.exportStr);
      this.exportJson = JSON.parse(this.exportStr);
      this.secretsStr = utils.makeSecretsEnv(this);
      // this.chains = chains;
      this.exporting = true;
    },

    async parseImport() {
      this.importError = false;
      if (!this.importString) return;
      let apiValue, extraValue;
      if (this.auth.value) apiValue = this.auth.value;
      if (this.extraAuth.value) extraValue = this.extraAuth.value;
      // try to convert yaml to json

      try {
        const json = yaml.parse(this.importString);
        if (json.toString() != "[object Object]") throw new Error("Not Object");
        console.log("parsed:", json.toString());
        const jsonStr = JSON.stringify(json, null, 2);
        console.log({ jsonStr });
        this.importString = jsonStr;
      } catch (e) {
        console.log("Error parsing yaml", e);
      }

      try {
        let parser = new SwaggerParser();
        const oas = await parser.dereference(JSON.parse(this.importString));
        this.importString = JSON.stringify(oas, null, 2);
        console.log("Dereferenced!");
      } catch (error) {
        console.log(error);
      }

      try {
        const json = JSON.parse(this.importString);
        if (json.host) json.servers = [{ url: json.host }];
        console.log("Parsing");
        let state;

        if (!json.ois) {
          state = await utils.parseOAS(json);
        } else {
          state = utils.parseConfig(json);
        }
        console.log("PARSIN", state.RPCs);
        Object.keys(state).forEach(key => {
          this[key] = state[key];
        });
        this.auth.value = apiValue;
        this.extraAuth.value = extraValue;

        this.storeSession();
      } catch (error) {
        console.log(error);
        this.importError = true;
      }
      console.log({ RPCs: this.RPCs });
    },
    parsePath() {
      console.log("Parsing path");
      // Remove this.server from this.ep.path
      this.ep.path = this.ep.path.replace(this.server, "");

      // get all strings inside of curly braces in this.ep.path
      let paths = this.ep.path.match(/\{[^}]*\}/g);
      if (paths) {
        let pathParams = [];
        // remove curly braces from each path
        paths.forEach(path => {
          let param = path.replace(path, path.replace(/\{|\}/g, ""));
          pathParams.push(param);
        });
        for (let param of pathParams) {
          if (this.ep.params.find(v => v.name === param && v.in == "path")) {
            continue;
          }
          this.ep.params.push({
            name: param,
            in: "path",
          });
        }
      }
      if (this.ep.path.includes("?")) {
        const querystring = require("querystring");
        const [path, queryParams] = this.ep.path.split("?");
        let parsedObject = querystring.parse(queryParams);
        for (let key in parsedObject) {
          this.param = {
            name: key,
            in: "query",
          };
          this.addParam();
        }
        this.ep.path = path;
      }
    },
    parseSecrets(config) {
      console.log("Found Secrets");
      console.log({ secrets: config.secrets });
      if (config.secrets.RPCs && config.secrets.RPCs.length) {
        this.chains.push({
          name: "Rinkeby",
          chainId: 4,
          url: config.secrets.RPCs[0],
          airnodeAddress: "0xC11593B87f258672b8eB02d9A723a429b15E9E03",
          authorizersAddress: "0x38DF5b7120b3B9b27238598d374779a37699379F",
          enabled: true,
          loading: false,
        });
        // If v0.2 and includes secrets
      } else if (config.secrets && config.secrets.chains) {
        this.chains = config.secrets.chains;
        // If v0.2 and no secrets
      }
      if (config.secrets && config.secrets.gatewayKey) {
        this.gatewayKey = config.secrets.gatewayKey;
      }
      if (config.secrets.auth) this.auth = config.secrets.auth;
      if (config.secrets.extraAuth) {
        this.extraAuth = config.secrets.extraAuth;
      }
      delete config.secrets;
      return config;
    },
    storeSession() {
      if (!this.storeSessions) return;
      console.log("Storing session");

      const session = {
        title: this.title,
        server: this.server,
        version: this.version,
        auth: this.auth,
        extraAuth: this.extraAuth,
        chains: this.chains,
        gatewayKey: this.gatewayKey,
        hasAuth: this.hasAuth,
        addedExtraAuth: this.addedExtraAuth,
        endpoints: this.endpoints,
      };
      localStorage.storeSessions = this.storeSessions;

      localStorage.session = JSON.stringify(session);
    },
    clear() {
      this.title = "";
      this.server = "";
      this.version = "";
      this.auth = {
        name: "",
        value: "",
        type: "apiKey",
        in: "query",
      };
      this.extraAuth = {
        name: "",
        value: "",
        type: "",
      };
      this.gatewayKey = "";
      this.chains = [];
      this.addedExtraAuth = false;
      this.endpoints = [];
      localStorage.clear();
      this.storeSession();
      this.confirmClear = false;
    },
    validEndpoint(ep) {
      // console.log("Getting valid endpoint");
      if (ep.method != "get" && ep.method != "post") return false;
      const { params } = ep;
      for (let p of params) {
        if (!this.paramTypes.includes(p.in)) return false;
        if (p.in == "path" && !ep.path.includes(`{${p.name}}`)) return false;
      }

      return true;
    },
    async onDrop(e) {
      this.dragover = false;
      try {
        this.importString = await new Promise(resolve => {
          if (e.dataTransfer.files.length > 1) {
            console.log("Only 1 at a time");
          } else {
            const file = e.dataTransfer.files[0];
            let reader = new FileReader();
            reader.onload = function(event) {
              const uploadString = event.target.result;
              resolve(uploadString);
            };
            reader.readAsText(file);
          }
        });
        this.parseImport();
      } catch (error) {
        console.log("Import Failed");
      }
      // console.log("Dropped!");
      // console.log(e);
      // console.log(e.dataTransfer.getData("text"));
    },
    async getConfigNames() {
      this.loading = true;
      this.savedConfigNames = await utils.getConfigTitles();
      this.loading = false;
    },

    async saveConfig() {
      this.loading = true;
      try {
        let config = JSON.parse(this.exportStr);
        if (!this.gatewayKey) this.gatewayKey = uuid();
        config.secrets = {
          chains: this.chains,
          gatewayKey: this.gatewayKey,
        };
        if (this.hasAuth && this.auth.value) config.secrets.auth = this.auth;
        if (this.addedExtraAuth && this.extraAuth.value) {
          config.secrets.extraAuth = this.extraAuth;
        }
        console.log({ config });
        const results = await utils.saveConfig(JSON.stringify(config));
        console.log(results);
        this.makeSnackbar("Saved! ✅");
      } catch (error) {
        this.makeSnackbar("Save Failed! 😱");
      }
      this.loading = false;
    },

    async deleteConfig(title) {
      this.loading = true;
      try {
        const results = await utils.deleteConfig(title);
        console.log(results);
        await this.getConfigNames();
        this.makeSnackbar("Deleted! ✅");
      } catch (error) {
        this.makeSnackbar("Delete Failed! 😱");
      }

      this.loading = false;
    },

    async exportAllOIS() {
      this.loading = true;
      try {
        await utils.getOISs();
      } catch (error) {
        this.makeSnackbar("Export Failed! 😱");
      }

      this.loading = false;
    },

    async importSavedConfig(title) {
      this.loading = true;
      try {
        console.log(this.selectedConfig);
        let configName = this.searchedConfigs[this.selectedConfig];
        if (title) configName = title;
        let config = await utils.getConfig(configName);
        let chains;
        if (config.secrets) {
          config = this.parseSecrets(config);
          chains = this.chains;
        }
        // const chains = this.chains;
        this.importString = JSON.stringify(config, null, 2);
        await this.parseImport();
        if (chains) this.chains = chains;
        // this.chains = chains;
        this.importing = false;
        this.makeSnackbar(`Imported ${configName}! ✅`);
      } catch (error) {
        this.makeSnackbar("Import Failed! 😱");
      }
      this.loading = false;
    },
    async importOnlyConfig() {
      if (this.searchedConfigs.length != 1) return;
      await this.importSavedConfig(this.searchedConfigs[0]);
    },
    async createRPC() {
      this.confirmCreateRPC = false;
      this.creatingRPC = true;
      const url = await utils.getRPC();
      this.creatingRPC = false;
      this.RPCs[0] = url;
    },
    async mergeConfigs() {
      console.log(this.selectedConfigs);
      this.mergingDialog = true;
      try {
        this.mergeConfigsNames = this.selectedConfigs.map(
          v => this.savedConfigNames[v]
        );
        const progressChunk = 100 / this.selectedConfigs.length;
        let mainConfig = null;
        for (let name of this.mergeConfigsNames) {
          const config = await utils.getConfig(name);
          this.mergeProgress += progressChunk;
          if (!mainConfig) mainConfig = config;
          else {
            mainConfig.triggers.request.push(...config.triggers.request);
            mainConfig.ois.push(config.ois[0]);
          }
        }
        delete mainConfig.title;
        // this.mergingDialog = false;
        this.exportJson = mainConfig;
        // this.exporting = true;

        console.log(this.mergeConfigsNames);
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },
    updateAuthorizers() {
      console.log(this.chains);
    },
  },

  computed: {
    savableEndpoint() {
      if (this.ep.path) return true;
      else return false;
    },
    utils() {
      return this.utils;
    },

    endpointPath() {
      return this.ep.path;
    },
    // check if string contains only letters
    onlyLetters() {
      const regex = /^[a-zA-Z]+$/;
      if (regex.test(this.title)) return true;
      else return false;
    },
    searchedConfigs() {
      if (!this.configSearch) return this.savedConfigNames;
      return this.savedConfigNames.filter(config => {
        return config.toLowerCase().includes(this.configSearch.toLowerCase());
      });
    },

    selectedEndpointParams() {
      let selectedEndpointParams = [];
      this.selectedEndpoints.forEach(i => {
        try {
          selectedEndpointParams = selectedEndpointParams.concat(
            this.endpoints[i].params
          );
        } catch (error) {
          console.log(error);
          console.log({ i, ep: this.endpoints[i] });
        }
      });

      let uniqueParams = [];
      selectedEndpointParams.forEach(param => {
        if (uniqueParams.find(v => v.name === param.name && v.in === param.in))
          return;
        uniqueParams.push(param);
      });
      return uniqueParams;

      // // Removing duplicates
      // selectedEndpointParams.filter(
      //   (v, i, a) =>
      //     a.findIndex(t => JSON.stringify(t) === JSON.stringify(v)) === i
      // );

      // selectedEndpointParams = selectedEndpointParams.filter((v, i, a) => {
      //   return a.indexOf(v) === i;
      // });
      // return selectedEndpointParams;
    },
  },
};
</script>

<style scoped>
.titleField {
  font-size: 1.6em;
}
html {
  overflow-y: auto;
}
</style>
