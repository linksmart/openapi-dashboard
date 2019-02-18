<template >
    <div>
        <div class="card">
            <div class="card-body">
                <Tag :tag="tag" />
                <vue-bootstrap4-table :columns="columns"
                                      :config="config"
                                      :classes="classes"
                                      :rows="rows">

                    <template slot="actions" slot-scope="props">
                        <div class="btn-group btn-group-xs" role="group" aria-label="Actions">
                            <a v-if='props.row.method == "get" && IS_CRUDABLE(props.row.path,props.row.method)' href="#" @click.prevent='showSelectEntryPointModal(props.row.path,props.row.method)' :class="crudButtonColor(props.row)" data-toggle="tooltip" data-placement="top" title="CRUD" class="btn btn-sm btn-action btn-secondary">
                                <i class="fas fa-table"></i>
                            </a>
                            <a v-if='props.row.method == "get"' href="" @click.prevent='handleFormView(props.row.path,props.row.method)' data-toggle="tooltip" data-placement="top" title="Form-view" class="btn btn-secondary btn-action">
                                <i class="fab fa-wpforms"></i>
                            </a>
                            <a v-if='props.row.method == "post"' href="" @click.prevent='initPost(props.row.path,props.row.method)' data-toggle="tooltip" data-placement="top" title="Post" class="btn btn-secondary btn-action">
                                <i class="fas fa-envelope"></i>
                            </a>
                            <a v-if='props.row.method == "delete"' href="" @click.prevent='handleDelete(props.row.path,props.row.method)' data-toggle="tooltip" data-placement="top" title="Delete" class="btn btn-danger btn-action">
                                <i class="fas fa-trash-alt"></i>
                            </a>
                            <a v-if='props.row.method == "put" && canPut(props.row.path)' href="" @click.prevent='handlePut(props.row.path,props.row.method)' data-toggle="tooltip" data-placement="top" title="Put" class="btn btn-sm btn-secondary btn-action">
                                <i class="fas fa-edit"></i>
                            </a>
                        </div>
                    </template>
                </vue-bootstrap4-table>

                <SelectEntryPointModal :table-index='propIndex'
                                       :show-modal='showModal'
                                       :response='response'
                                       :parameters="parameters"
                                       :server-url="SERVER_URL"
                                       :path='selectedPath'
                                       :method='selectedMethod'
                                       @closeModal="showModal=false"
                                       @startCrud="startCrud"
                                       @clearParameters="parameters=[]"/>

                <form-view-parameters-modal :table-index='propIndex'
                                            :show-modal='showFormViewModal'
                                            :path='selectedPath'
                                            :method='selectedMethod'
                                            :server-url="SERVER_URL"
                                            :parameters="parameters"
                                            @closeModal="showFormViewModal=false"
                                            @go-to-form-view="goToFormView"
                                            />

                <delete-modal :table-index='propIndex'
                                :show-modal='showDeleteModal'
                                :path='selectedPath'
                                :method='selectedMethod'
                                :server-url="SERVER_URL"
                                :has-id="true"
                                :parameters="parameters"
                                @closeModal="showDeleteModal=false"
                                @trigger-delete="triggerDelete"/>

                <put-modal :table-index='propIndex'
                                :show-modal='showPutModal'
                                :path='getSelectedPath'
                                :method='getSelectedMethod'
                                :server-url="SERVER_URL"
                                :has-id="true"
                                :parameters="getParameters"
                                @closeModal="showPutModal=false"
                                @trigger-put="goToPutView"/>

                </div>
            </div>
            <br>
        <success-response :response="successResponse"
                        :show-modal="showSuccessResponseModal"
                        @closeModal="showSuccessResponseModal=false"/>
        <failure-response :response="failureResponse"
                        :show-modal="showFailureResponseModal"
                        @closeModal="showFailureResponseModal=false"/>
        </div>
    </template>


    <script>
    import { mapMutations,mapGetters } from 'vuex'
    import Tag from './tag/Tag.vue';
    import SelectEntryPointModal from './modals/SelectEntryPointModal.vue';
    import FormViewParametersModal from './modals/FormViewParametersModal.vue';
    import DeleteModal from './modals/DeleteModal.vue';
    import PutModal from './modals/PutModal.vue';
    import SuccessResponse from "./modals/SuccessResponse.vue";
    import FailureResponse from "./modals/FailureResponse.vue";
    import VueBootstrap4Table from 'vue-bootstrap4-table'

    const _ = require("lodash")

    export default {

        props: ['group','propIndex'],
        data: function () {
            return {
                showModal: false,
                showFormViewModal: false,
                showDeleteModal:false,
                showPutModal:false,
                columns: [
                    {
                        label: 'Path',
                        name: 'path',
                        row_text_alignment:  "text-left",
                        column_text_alignment:  "text-left",
                    },
                    {
                        label: 'Method',
                        name: 'method',
                        row_text_alignment:  "text-left",
                        column_text_alignment:  "text-left",
                    },
                    {
                        label: 'Actions',
                        name: 'actions',
                        row_text_alignment:  "text-left",
                        column_text_alignment:  "text-left",
                    },
                ],
                classes: {
                    table: "table-striped table-bordered table-sm"
                },
                rows: [],
                response: {},
                request_body: {},
                parameters: [],
                selectedPath: '',
                selectedMethod: '',
                getParameters: [],
                getSelectedPath: '',
                getSelectedMethod: '',
                config: {
                    global_search: {
                        visibility: false,
                    },
                    checkbox_rows: false,
                    rows_selectable: false,
                    card_mode: false,
                    pagination:false,
                    pagination_info:false,
                    show_refresh_button:false,
                    show_reset_button:false,
                    highlight_row_hover:false
                },
                successResponse: {},
                failureResponse: {},
                showSuccessResponseModal: false,
                showFailureResponseModal: false
            }
        },
        mounted(){
            this.rows = this.group.paths;
        },
        components: {
            Tag,
            SelectEntryPointModal,
            FormViewParametersModal,
            DeleteModal,
            PutModal,
            VueBootstrap4Table,
            SuccessResponse,
            FailureResponse
        },
        methods: {
            ...mapMutations( [
                'addCrudTableViewState',
                'updateCrudTableViewState',
                'removeCrudTableViewState',
            ]),
            showSelectEntryPointModal(path,method) {
                let index = this.crudStateIndex(path,method);

                if (index > -1) {
                    this.$router.push({ path: `/crud/`, query: { path, method } });
                    return;
                }

                if (this.selectedPath != path || this.selectedMethod != method) {
                    this.response = this.getResponseByPathAndMethod(path,method);
                    this.parameters = _.cloneDeep(this.getParametersByPathAndMethod(path,method));
                    this.selectedPath = path;
                    this.selectedMethod = method;
                }
                this.showModal = true;
            },
            handleFormView(path,method) {
                if (this.selectedPath != path || this.selectedMethod != method) {
                    this.parameters = this.getParametersByPathAndMethod(path,method);
                    this.selectedPath = path;
                    this.selectedMethod = method;
                }
                if (this.parameters.length > 0) {
                    this.showFormViewModal = true;
                } else{
                    this.goToFormView(this.SERVER_URL + path)
                }
            },
            handlePut(path,method) {
                let getPathIndex = this.getPathIndexByPutPath(path);
                if (getPathIndex == -1) {
                    return;
                }

                let get = this.group.paths[getPathIndex];
                if (this.selectedPath != get.path || this.selectedMethod != get.method) {
                    this.parameters = this.getParametersByPathAndMethod(path,method);
                    this.selectedPath = path;
                    this.selectedMethod = method;
                    this.getParameters = this.getParametersByPathAndMethod(get.path,get.method);
                    this.getSelectedPath = get.path;
                    this.getSelectedMethod = get.method;
                }
                if (this.parameters.length > 0) {
                    this.showPutModal = true;
                } else{
                    this.goToPutView(this.SERVER_URL + path)
                }
            },
            handleDelete(path,method) {
                if (this.selectedPath != path || this.selectedMethod != method) {
                    this.parameters = this.getParametersByPathAndMethod(path,method);
                    this.selectedPath = path;
                    this.selectedMethod = method;
                }
                if (this.parameters.length > 0) {
                    this.showDeleteModal = true;
                } else{
                    this.triggerDelete(this.SERVER_URL+path);
                }
            },
            triggerDelete(url) {
                this.showDeleteModal = false;
                axios.delete(url)
                .then((response) => {
                    this.successResponse = response;
                    this.failureResponse = {};
                    this.showSuccessResponseModal = true;
                })
                .catch((error) => {
                    this.failureResponse = error.response;
                    this.successResponse = {};
                    this.showFailureResponseModal = true;
                })
            },
            initPost(path,method) {
                this.request_body = this.getRequestByPathAndMethod(path,method);
                let request_parameters = this.getParametersByPathAndMethod(path,method);
                this.selectedPath = path;
                this.selectedMethod = method;
                this.$router.push({
                    name: 'post',
                    params: {
                        request_body : _.cloneDeep(this.request_body),
                        request_parameters : request_parameters,
                        selectedPath : path,
                        selectedMethod : method
                        }
                    });
            },
            crudButtonColor(row) {
                let result = this.crudStateIndex(row.path,row.method);
                return {'btn-success' : (result > -1), 'btn-secondary' : (result > -1)}
            },
            startCrud(payload) {

                let index = _.findIndex(this.getCrudTableViewStates, { 'path': this.selectedPath, 'method': this.selectedMethod });

                if (index > -1) {
                    this.updateCrudTableViewState({index: index,payload: payload});
                } else {
                    let state = {
                        path: this.selectedPath,
                        method: this.selectedMethod,
                        payload: payload,
                        paths: _.cloneDeep(this.group.paths)
                    };
                    this.addCrudTableViewState(state);
                }

                this.showModal = false;

                // next tick wait until the current DOM updates and then exeutes the function
                this.$nextTick(function () {
                    if (index == -1) {
                        index = this.getCrudTableViewStates.length - 1;
                    }
                    this.$router.push({ path: `/crud/`, query: { path: this.selectedPath, method:this.selectedMethod } })
                });
            },
            goToFormView(url) {
                this.showFormViewModal = false;
                this.$nextTick(function () {
                    this.$router.push({
                        name: 'formView',
                        params: {
                            url
                            }
                    });
                });
            },
            canPut(putPath) {
                return  this.getPathIndexByPutPath(putPath) > -1;
            },
            getPathIndexByPutPath(putPath) {
                return _.findIndex(this.group.paths, { method: "get", path: putPath});
            },
            goToPutView(url) {
                this.showPutModal = false;
                axios.get(url)
                .then((response) => {
                    if (response.status >= 200 && response.status < 230) {
                        let prefils = this.parameters.map(parameter => {
                            return {
                                name : parameter.name,
                                value : (_.has(response.data,parameter.name) ? response.data[parameter.name] : "")
                            }
                        })
                        this.$router.push({ name: 'put', params: {
                                path: this.selectedPath,
                                method: this.selectedMethod,
                                model: response.data,
                                prefils
                            }
                        });
                    }
                })
                .catch((error) => {
                    this.failureResponse = error.response;
                    this.successResponse = {};
                    this.showFailureResponseModal = true;
                })
            }
        },
        computed: {
            ...mapGetters([
            "getTagByName",
            "getCrudTableViewStates",
            "getResponseByPathAndMethod",
            "getParametersByPathAndMethod",
            "getRequestByPathAndMethod",
            "IS_CRUDABLE",
            "SERVER_URL",
            "crudStateIndex"
            ]),
            tag(){
                return this.getTagByName(this.group.tag_name);
            }
        }
    }

</script>
