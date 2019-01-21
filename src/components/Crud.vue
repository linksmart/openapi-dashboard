<template >
    <div class="container-fluid">
        <div class="card">
            <div class="card-body">
                    <vue-bootstrap4-table :columns="columns"
                                        :config="config"
                                        :rows="rows"
                                        :actions="actions"
                                        @on-update-columns="showModal = true"
                                        @on-change-query="onChangeQuery"
                                        :totalRows="totalRows">
                        <template slot="actions" slot-scope="props">
                            <div class="btn-group" role="group" aria-label="Actions">
                                <template v-if="canDelete">
                                    <a v-for="(action,index) in deleteActions" :key="index" href="" @click.prevent='handleDelete(action,props.row)' data-toggle="tooltip" data-placement="top" title="Delete" class="btn btn-sm btn-danger btn-action">
                                        <i class="fas fa-trash-alt"></i>
                                    </a>
                                </template>
                            </div>
                        </template>
                    </vue-bootstrap4-table>

                    <SelectAttributesModal :show-modal='showModal' :selected-attributes='selected_attributes' :entry-data-properties='entry_data_properties' @closeModal="showModal=false" @updateAttributes="updateAttributes"/>

                    <delete-modal :show-modal='showDeleteModal'
                                    :path='selectedDeletePath'
                                    :method='selectedDeleteMethod'
                                    :server-url="SERVER_URL"
                                    :parameters="deleteRequestParameters"
                                    :prefils="deleteRequestParametersPrefiles"
                                    @closeModal="showDeleteModal=false"
                                    @trigger-delete="triggerDelete"/>
            </div>
            <div class="card-footer">
                <div v-show='deleteSuccess!==""' class="alert alert-success" role="alert">
                    <button type="button" class="close" aria-label="Close" @click="deleteSuccess=''">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <strong>Success!</strong> {{this.deleteSuccess}}
                </div>
                <div v-show='deleteError!==""' class="alert alert-danger" role="alert">
                    <button type="button" class="close" aria-label="Close" @click="deleteError=''">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <strong>Oh snap!</strong> {{this.deleteError}}
                </div>
            </div>
        </div>

    </div>
</template>


<script>
import axios from 'axios';
import { mapMutations,mapGetters } from 'vuex';
var URI = require('urijs');
import VueBootstrap4Table from 'vue-bootstrap4-table'
import SelectAttributesModal from './modals/SelectAttributesModal.vue';
import DeleteModal from './modals/DeleteModal.vue';

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
            selected_attributes: this.$route.params.payload.selected_attributes,
            entry_data_properties: this.$route.params.payload.entry_data_properties,
            request_params: this.$route.params.payload.request_params,
            rows: [],
            columns: [],
            data: [],
            paths: [],
            showModal: false,
            config: {
                pagination:true,
                global_search: {
                    visibility: false,
                },
                per_page: 5,
                checkbox_rows: false,
                rows_selectable: false,
                card_mode: false,
                show_refresh_button:false,
                show_reset_button:false,
                server_mode:true
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
                }
            ],
            deleteActions : [],
            deleteRequestParameters: [],
            deleteRequestParametersPrefiles: [],
            showDeleteModal: false,
            selectedDeletePath: '',
            selectedDeleteMethod: '',
            deleteSuccess:"",
            deleteError:"",
        }
    },
    components: {
        SelectAttributesModal,
        VueBootstrap4Table,
        DeleteModal
    },
    mounted(){
        this.method = this.$route.params.payload.method;
        this.fullUrl = this.$route.params.payload.fullUrl;
        this.url = this.$route.params.payload.url;
        this.entry_data_path = this.$route.params.payload.entry_data_path;
        this.requestQueryParams = this.$route.params.payload.queryParams;
        this.uriParams = this.$route.params.payload.uriParams;
        this.paths = this.$route.params.paths;
        this.generateDeleteActions();
        if (this.requestQueryParams.per_page) {
            // this.config.per_page = this.requestQueryParams.per_page;
            // this.config.page = this.requestQueryParams.page;
        }
        this.getData(this.fullUrl);
        this.generateColumns();
        this.generateRows();
    },
    methods: {
        generateDeleteActions() {
            this.deleteActions = [];
            this.paths.forEach((path) => {
                if (path.method == "delete") {
                    let action = {
                        "path" : path.path,
                        "method" : path.method,
                        "requestParameters" : _.cloneDeep(this.getParametersByPathAndMethod(path.path,path.method))
                    }

                    this.deleteActions.push(action);
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
        triggerDelete(url) {
            this.showDeleteModal = false;
            axios.delete(url)
            .then((response) => {
                this.deleteError = "";
                this.deleteSuccess = JSON.stringify(response.data);
                this.getData(this.fullUrl);
            })
            .catch((error) => {
                this.deleteSuccess = "";
                this.deleteError = JSON.stringify(error.response.data);
            })

        },
        getData(url) {
            let self = this;
            axios.get(url)
            .then(function (response) {
                self.data = _.get(response,"data."+self.entry_data_path);
                self.totalRows = response.data.total;
                self.generateRows(self.data);
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
            this.columns = columns ;
        },
        onChangeQuery(queryParams) {
            this.queryParams = queryParams;
            let paginationQuery = {
                'page': queryParams.page,
                'per_page': queryParams.per_page,
            };
        console.log('change');

            if ((this.url == "" && this.fullUrl == "")) {
                return;
            }

            let fullPath = new URI(this.fullUrl).addQuery(paginationQuery).toString();
            this.getData(fullPath);
        },
        generateRows(data) {
            let rows = [];
            let self = this;
            _.forEach(data,function(value,key) {
                let row = {

                };
                _.forEach(self.selected_attributes,function(selected_attribute,key) {
                    row[selected_attribute.data_path] = _.get(value,selected_attribute.data_path);
                });
                rows.push(row);
            });
            this.rows = rows;
        },
        updateAttributes(selected_attributes) {
            this.selected_attributes = selected_attributes;
            this.generateColumns();
            this.generateRows(this.data);
        }
    },
    computed: {
        ...mapGetters([
        'SERVER_URL',
        'getParametersByPathAndMethod'
        ]),
        canDelete() {
            let path = _.find(this.paths, { 'method': "delete" });
            // let rootAttribute = _.find(this.selected_attributes, { 'isRoot': true });
            return (path) ? true : false;
        }
    },
    watch: {
        selected_attributes: {
            handler: function(newValue) {
                this.generateDeleteActions();
            },
            deep: true
        }
    }
}
</script>
