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
                  <v-list-item id="addRPC" @click="extraRPC = true">
                    <v-list-item-title>Add RPC</v-list-item-title>
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
              :rules="[required, onlyLetters]"
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
            <v-row align="center" justify="center">
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="RPCs[0]"
                  placeholder="https://rinkeby.infura.io/v3/{ FILL }"
                  label="RPC URL"
                  :rules="serverRules"
                  id="rpcURL"
                  @input="storeSession"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center" justify="center" v-if="extraRPC">
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="RPCs[1]"
                  placeholder="https://rinkeby.infura.io/v3/{ FILL }"
                  label="RPC URL"
                  autofocus
                  @input="storeSession"
                  :rules="serverRules"
                  @blur="RPCs[1] ? '' : (extraRPC = false)"
                  id="rpcURL2"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
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
              <!-- <v-row align="center" justify="center">
                <v-col cols="12" md="3">
                  <v-text-field
                    :disabled="!hasAuth"
                    v-model="extraAuth.name"
                    label="Name"
                    @input="storeSession"
                    placeholder="X-API-KEY"
                    :rules="hasAuth ? required : false"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-select
                    :disabled="!hasAuth"
                    v-model="extraAuth.scheme"
                    label="Scheme"
                    :items="['basic', 'bearer']"
                    required
                    @input="storeSession"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    :disabled="!hasAuth"
                    v-model="extraAuth.value"
                    label="Value"
                    @input="storeSession"
                    placeholder="XXXAPI_KEYXXX (Leave blank if N/A)"
                    required
                  ></v-text-field>
                </v-col>
              </v-row> -->
            </template>
            <v-row align="center" justify="center">
              <v-col cols="12" md="1"></v-col>
              <v-col cols="12" md="11">
                <v-card-title>
                  Endpoints
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
            <v-col cols="12" md="5">
              <v-text-field
                v-model="ep.path"
                label="Path"
                id="path"
                autofocus
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
            color="primary"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="importing" max-width="50%">
      <v-card>
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
            rows="20"
            autofocus
            placeholder='{ "swagger": "2.0", "info": { "version": "1.0.0" } }'
            @input="parseImport"
            no-resize
            :error="importError"
          >
          </v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
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
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="exporting" max-width="50%" :overlay-opacity="75">
      <v-card>
        <v-card-title>
          Export
        </v-card-title>
        <v-card-subtitle>
          Edit your config.json
        </v-card-subtitle>
        <v-card-text>
          <v-jsoneditor
            v-model="exportJson"
            :plus="true"
            @error="importError = true"
            height="600px"
            :options="options"
          >
          </v-jsoneditor>
        </v-card-text>

        <v-btn block @click="downloading = true" text color="primary">
          Download
        </v-btn>
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
    <v-dialog v-model="exporting" max-width="50%" :overlay-opacity="75">
      <v-card>
        <v-card-title>
          Export
        </v-card-title>
        <v-card-subtitle>
          Edit your config.json
        </v-card-subtitle>
        <v-card-text>
          <v-jsoneditor
            v-model="exportJson"
            :plus="true"
            @error="importError = true"
            height="600px"
            :options="options"
          >
          </v-jsoneditor>
        </v-card-text>

        <v-btn block @click="downloading = true" text color="primary">
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
    <v-dialog v-model="confirmClear" max-width="400px">
      <v-card>
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
  </v-container>
</template>

<script>
import utils from "../utils/utils";
import VJsoneditor from "v-jsoneditor/src/index";
import yaml from "yaml";

export default {
  name: "Home",
  components: {
    VJsoneditor,
  },
  data() {
    return {
      title: "",
      version: "",
      server: "",
      importString: "",
      dragover: false,
      exportStr: "{}",
      selectedEndpoints: [],
      valid: false,
      options: {
        mode: "code",
        enableTransform: false,
      },
      RPCs: [""],
      extraRPC: false,
      addedExtraAuth: false,
      importError: false,
      exportType: "oas",
      exporting: false,
      storeSessions: localStorage.storeSessions === "false" ? false : true,
      confirmClear: false,
      importing: false,
      selectingEndpoint: false,
      confirmDelete: false,
      selectedParam: null,
      downloading: false,
      editing: false,
      paramTypes: ["query", "header", "path", "cookie"],
      downloadOptions: ["OAS", "OIS", "Readme", "Deployment"],
      exportJson: {},
      editingConfig: false,
      bulkEditParamMenu: false,
      endpointMenu: false,
      bulkMenu: false,
      bulkAddParamMenu: false,
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
        // reservedParam: {
        //   type: "int256",
        //   path: "",
        //   times: false,
        // },
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
    exportJson() {
      console.log("Changed");
      this.exportStr = JSON.stringify(this.exportJson, null, 2);
      this.importString = this.exportStr;
      this.parseImport();
    },

    selectedParam() {
      console.log(this.selectedEndpointParams[this.selectedParam]);
    },
    storeSessions() {
      localStorage.storeSessions = this.storeSessions;
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
        this.RPCs = session.RPCs;
        this.auth = session.auth;
        this.extraRPC = session.extraRPC;
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
        // reservedParam: {
        //   type: "int256",
        //   path: "",
        //   times: false,
        // },
      };
      this.endpointMenu = false;
      this.storeSession();
    },
    addParam() {
      if (!this.param.name || (this.param.fixed && !this.param.value)) return;
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
      console.log("Auth again", this.extraAuth);
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
        // reservedParam: {
        //   type: "int256",
        //   path: "",
        //   times: false,
        // },
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
      for (let i of this.selectedEndpoints) {
        this.endpoints[i].params.push(this.param);
      }
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
      this.oas = utils.makeOAS(this);
      this.exportStr = utils.makeConfig(this);
      console.log(this.exportStr);
      this.exportJson = JSON.parse(this.exportStr);
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
        const SwaggerParser = require("@apidevtools/swagger-parser");
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
    },
    parsePath() {
      // get all strings inside of curly braces in this.ep.path
      let paths = this.ep.path.match(/\{[^}]*\}/g);
      if (!paths) return;
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
      return pathParams;
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
        RPCs: this.RPCs,
        extraRPC: this.extraRPC,
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
        type: "",
      };
      this.extraAuth = {
        name: "",
        value: "",
        type: "",
      };
      this.RPCs = [];
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
  },

  computed: {
    savableEndpoint() {
      if (this.ep.path) return true;
      else return false;
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
