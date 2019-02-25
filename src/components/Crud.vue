<template >
    <div class="container-fluid">
        <div v-show="!isTableView" class="card">
            <div class="card-body">
                    <vue-bootstrap4-table :columns="formViewColumns"
                                        :config="config"
                                        :rows="data"
                                        :actions="formViewActions"
                                        :classes="classes"
                                        @on-update-columns="showModal = true"
                                        @on-post="goToPost"
                                        @on-change-query="onChangeQuery"
                                        @on-refresh="onRefresh"
                                        @on-reset-state="onResetState"
                                        @switch-to-table-view="isTableView = !isTableView"
                                        :totalRows="totalRows">
                        <template slot="actions" slot-scope="props">
                            <div class="btn-group btn-group-xs" role="group" aria-label="Actions">
                                <template v-for="(action,index) in rowActions">
                                    <template v-if="action.method == 'delete'">
                                        <button :key="index" @click.prevent='handleDelete(action,props.row)' data-toggle="tooltip" data-placement="top" title="Delete" class="btn btn-sm btn-danger btn-action">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </template>
                                    <template v-if="action.method == 'put'">
                                        <button :key="index" @click.prevent='handlePut(action,props.row)' data-toggle="tooltip" data-placement="top" title="Put" class="btn btn-sm btn-secondary btn-action">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </template>
                                </template>
                            </div>
                        </template>
                        <template slot="id" slot-scope="props">
                            <form-view :preloaded-model="props.row"></form-view>
                        </template>
                    </vue-bootstrap4-table>
            </div>
        </div>
        <br>
        <div v-show="isTableView" class="card">
            <div class="card-body">
                    <vue-bootstrap4-table :columns="columns"
                                        :config="config"
                                        :rows="rows"
                                        :actions="actions"
                                        :classes="classes"
                                        @on-update-columns="showModal = true"
                                        @on-post="goToPost"
                                        @on-change-query="onChangeQuery"
                                        @on-refresh="onRefresh"
                                        @on-reset-state="onResetState"
                                        @switch-to-form-view="isTableView = !isTableView"
                                        :totalRows="totalRows">
                        <template slot="actions" slot-scope="props">
                            <div class="btn-group btn-group-xs" role="group" aria-label="Actions">
                                <template v-for="(action,index) in rowActions">
                                    <template v-if="action.method == 'delete'">
                                        <button :key="index" @click.prevent='handleDelete(action,props.row)' data-toggle="tooltip" data-placement="top" title="Delete" class="btn btn-sm btn-danger btn-action">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </template>
                                    <template v-if="action.method == 'put'">
                                        <button :key="index" @click.prevent='handlePut(action,props.row)' data-toggle="tooltip" data-placement="top" title="Put" class="btn btn-sm btn-secondary btn-action">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </template>
                                </template>
                            </div>
                        </template>
                    </vue-bootstrap4-table>

                    <SelectAttributesModal :show-modal='showModal' :selected-attributes='selected_attributes' :entry-data-properties='entry_data_properties' @closeModal="showModal=false" @updateAttributes="updateAttributes"/>

                    <delete-modal :show-modal='showDeleteModal'
                                    :path='selectedDeletePath'
                                    :method='selectedDeleteMethod'
                                    :server-url="SERVER_URL"
                                    :has-id="hasId"
                                    :parameters="deleteRequestParameters"
                                    :prefils="deleteRequestParametersPrefiles"
                                    @closeModal="showDeleteModal=false"
                                    @trigger-delete="triggerDelete"/>
            </div>
        </div>

        <success-response :response="successResponse"
                            :show-modal="showSuccessResponseModal"
                            @closeModal="showSuccessResponseModal=false"/>
        <failure-response :response="failureResponse"
                            :show-modal="showFailureResponseModal"
                            @closeModal="showFailureResponseModal=false"/>
    </div>
</template>


<script>
import axios from 'axios';
import { mapMutations,mapGetters } from 'vuex';
var URI = require('urijs');
var URITemplate = require('urijs/src/URITemplate');
import VueBootstrap4Table from 'vue-bootstrap4-table'
import SelectAttributesModal from './modals/SelectAttributesModal.vue';
import DeleteModal from './modals/DeleteModal.vue';
import SuccessResponse from "./modals/SuccessResponse.vue";
import FailureResponse from "./modals/FailureResponse.vue";
import FormView from "./FormView.vue";

var _ = {
  forEach: require('lodash/forEach'),
  get: require('lodash/get'),
  findIndex: require('lodash/findIndex'),
  find: require('lodash/find'),
  isEmpty: require('lodash/isEmpty'),
  cloneDeep: require('lodash/cloneDeep'),
};
export default {
    data: function () {
        return {
            method:"",
            fullUrl:"",
            url:"",
            uriParams: {},
            requestQueryParams: {},
            entry_data_path:"",
            selected_attributes: [],
            entry_data_properties: {},
            request_params: {},
            rows: [],
            columns: [],
            formViewColumns: [],
            data: [],
            paths: [],
            showModal: false,
            config: {
                pagination:true,
                global_search: {
                    visibility: false,
                },
                per_page: 5,
                page: 1,
                checkbox_rows: false,
                rows_selectable: false,
                card_mode: false,
                show_refresh_button:false,
                show_reset_button:false,
                server_mode:true
            },
            classes: {
                table: "table-striped table-bordered table-sm"
            },
            queryParams: {
                sort: [],
                filters: [],
                global_search: "",
                per_page: 10,
                page: 1,
            },
            totalRows:0,
            actions: [
                {
                    btn_text: "Update Columns",
                    event_name: "on-update-columns"
                },
                {
                    btn_text: "Post",
                    event_name: "on-post"
                },
                {
                    btn_text: "Refresh",
                    event_name: "on-refresh"
                },
                {
                    btn_text: "Reset",
                    event_name: "on-reset-state"
                },
                {
                    btn_text: "Form View",
                    event_name: "switch-to-form-view"
                },
            ],
            formViewActions: [
                {
                    btn_text: "Post",
                    event_name: "on-post"
                },
                {
                    btn_text: "Refresh",
                    event_name: "on-refresh"
                },
                {
                    btn_text: "Reset",
                    event_name: "on-reset-state"
                },
                {
                    btn_text: "Table View",
                    event_name: "switch-to-table-view"
                },
            ],
            rowActions : [],
            deleteRequestParameters: [],
            deleteRequestParametersPrefiles: [],
            showDeleteModal: false,
            selectedDeletePath: '',
            selectedDeleteMethod: '',
            stateIndex : -1,
            successResponse: {},
            failureResponse: {},
            showSuccessResponseModal: false,
            showFailureResponseModal: false,
            isTableView: true,
        }
    },
    components: {
        SelectAttributesModal,
        VueBootstrap4Table,
        DeleteModal,
        SuccessResponse,
        FailureResponse,
        FormView
    },
    mounted(){
        this.stateIndex = this.crudStateIndex(this.$route.query.path,this.$route.query.method);
        if (this.stateIndex == -1 || this.stateIndex >= this.getCrudTableViewStatesCount) {
            this.$router.push({name: 'explorer'});
            return;
        }
        let state = this.getCrudTableViewState(this.stateIndex);

        let payload = state.payload;
        this.method = payload.method;
        this.fullUrl = payload.fullUrl;
        this.url = payload.url;
        this.entry_data_path = payload.entry_data_path;
        this.requestQueryParams = payload.queryParams;
        this.uriParams = payload.uriParams;
        this.paths = state.paths;

        this.selected_attributes = payload.selected_attributes;
        this.entry_data_properties = payload.entry_data_properties;
        this.request_params = payload.request_params;
        this.generateActions();
        // this.generatePutActions();
        if (this.requestQueryParams.per_page) {
            this.config.per_page = this.requestQueryParams.per_page;
        }
        if (this.requestQueryParams.page) {
            this.config.page = this.requestQueryParams.page;
        }
        this.getData(this.fullUrl);
        this.generateColumns();
        this.generateFormViewColumns();
        this.generateRows();
    },
    methods: {
        ...mapMutations( [
            'updateCrudTableViewStateSelectedAttributes',
            'removeCrudTableViewState'
        ]),
        generateActions() {
            this.rowActions = [];
            this.paths.forEach((path) => {
                if (path.method == "delete" || path.method == "put") {
                    let action = {
                        "path" : path.path,
                        "method" : path.method,
                        "requestParameters" : _.cloneDeep(this.getParametersByPathAndMethod(path.path,path.method))
                    }

                    this.rowActions.push(action);
                }
            });
        },
        // generatePutActions() {
        //     this.putActions = [];
        //     this.paths.forEach((path) => {
        //         if (path.method == "put") {
        //             let action = {
        //                 "path" : path.path,
        //                 "method" : path.method,
        //                 "requestParameters" : _.cloneDeep(this.getParametersByPathAndMethod(path.path,path.method))
        //             }

        //             this.putActions.push(action);
        //         }
        //     });
        // },
        onRefresh() {
            this.getData(this.fullUrl);
        },
        onResetState() {
            this.removeCrudTableViewState(this.stateIndex);
            this.$router.push({name: 'explorer'});
        },

        goToPost() {
            if (!this.canPost) {
                console.log("missing post parameters");
                return;
            }
            let post = _.find(this.paths, {"method":"post"});
            let path = post.path;
            let method = post.method;
            let requestBody = this.getRequestByPathAndMethod(path,method);
            let requestParameters = this.getParametersByPathAndMethod(path,method);

            this.$router.push({
                name: 'post',
                params: {
                    request_body : _.cloneDeep(requestBody),
                    request_parameters : requestParameters,
                    selectedPath : path,
                    selectedMethod : method
                    }
                });

        },
        handleDelete(action,row) {
            this.deleteRequestParameters = action.requestParameters;
            this.selectedDeletePath = action.path;
            this.selectedDeleteMethod = action.method;
            let rootAttribute = _.find(this.selected_attributes,{isRoot:true});
            if (rootAttribute) {
                let prefils = [{
                    name: rootAttribute.name,
                    value: _.get(row,rootAttribute.name)
                }];
                this.deleteRequestParametersPrefiles = prefils;
            } else {
                this.deleteRequestParametersPrefiles = [];
            }
            if (action.requestParameters.length > 0) {
                this.showDeleteModal = true;
            } else {
                this.triggerDelete(this.SERVER_URL+path);
            }
        },
        handlePut(action,row) {
            let prefils = [];
            let rootAttribute = _.find(this.selected_attributes,{isRoot:true});
            if (rootAttribute) {
                prefils = [{
                    name: rootAttribute.name,
                    value: _.get(row,rootAttribute.name)
                }];
            }
            this.$router.push({ name: 'put', params: {
                    path: action.path,
                    method: action.method,
                    model: row,
                    prefils: prefils
                }
            });
        },
        triggerDelete(url) {
            this.showDeleteModal = false;
            axios.delete(url)
            .then((response) => {
                this.successResponse = response;
                this.failureResponse = {};
                this.showSuccessResponseModal = true;
                this.getData(this.fullUrl);
            })
            .catch((error) => {
                this.failureResponse = error.response;
                this.successResponse = {};
                this.showFailureResponseModal = true;
            })

        },
        getData(url) {
            axios.get(url)
            .then((response) => {
                this.data = _.get(response,"data."+this.entry_data_path);
                this.totalRows = response.data.total;
                // this.config.page = response.data.page;
                this.generateRows(this.data);
            });
        },
        generateColumns() {
            let columns = [];
            let self = this;
            _.forEach(this.selected_attributes,function(selected_attribute,key) {
                columns.push({
                    label: selected_attribute.data_path,
                    name: selected_attribute.data_path,
                    row_text_alignment:  "text-left",
                    column_text_alignment:  "text-left",
                });
            });
            let actionColumn = {
                label:"Action",
                name:"actions",
                row_text_alignment:  "text-left",
                column_text_alignment:  "text-left"
            };
            columns.push(actionColumn);
            this.columns = columns;
        },
        generateFormViewColumns() {
            let columns = [];

            columns.push({
                column_text_alignment:"text-left",
                label:"Form view",
                name:"id",
                row_text_alignment:"text-left",
            });

            let actionColumn = {
                label:"Action",
                name:"actions",
                row_text_alignment:  "text-left",
                column_text_alignment:  "text-left"
            };

            columns.push(actionColumn);
            this.formViewColumns = columns;
        },
        onChangeQuery(queryParams) {
            this.queryParams = queryParams;
            let paginationQuery = {
                'page': queryParams.page,
                'per_page': queryParams.per_page,
            };

            if ((this.url == "" && this.fullUrl == "")) {
                return;
            }
            let url = URITemplate(this.url).expand(this.uriParams);
            let fullPath = new URI(url).addQuery(paginationQuery).toString();
            this.getData(fullPath);
        },
        generateRows(data) {
            if(!data) {
                return;
            }

            let rows = [];
            // let self = this;
            // _.forEach(data,function(value,key) {
            //     let row = {

            //     };
            //     _.forEach(self.selected_attributes,function(selected_attribute,key) {
            //         row[selected_attribute.data_path] = _.get(value,selected_attribute.data_path);
            //     });
            //     rows.push(row);
            // });
            this.rows = data;
        },
        updateAttributes(selected_attributes) {
            this.selected_attributes = selected_attributes;
            this.updateCrudTableViewStateSelectedAttributes({index : this.stateIndex, selectedAttributes : selected_attributes});
            this.generateColumns();
            this.generateFormViewColumns();
            this.generateRows(this.data);
        }
    },
    computed: {
        ...mapGetters([
        'SERVER_URL',
        'getParametersByPathAndMethod',
        'getRequestByPathAndMethod',
        'getCrudTableViewState',
        'getCrudTableViewStatesCount',
        'crudStateIndex',
        ]),
        canDelete() {
            let path = _.find(this.paths, { 'method': "delete" });
            // let rootAttribute = _.find(this.selected_attributes, { 'isRoot': true });
            return (path) ? true : false;
        },
        hasId() {
            let flag = false;
            this.selected_attributes.some(selectedAttribute => {
                if (selectedAttribute.isRoot) {
                    flag = true;
                    return true;
                }
            })
            return flag;
        },
        canPost() {
            return (_.findIndex(this.paths, { 'method': "post"}) != -1)
        },
        canPut() {
            return (_.findIndex(this.paths, { 'method': "put"}) != -1);
        }
    },
    watch: {
        selected_attributes: {
            handler: function(newValue) {
                // TODO - potentially remove these two fn calls in future
                this.generateActions();
                // this.generatePutActions();
            },
            deep: true
        }
    }
}
</script>
