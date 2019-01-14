<template >
    <div>
        <div class="card">
            <div class="card-body">
                <Tag :tag="tag" />
                <vue-good-table
                :columns="columns"
                :rows="rows">

                <template slot="table-row" slot-scope="props">
                    <span v-if="props.column.label == 'Actions'">
                        <div class="btn-group" role="group" aria-label="Actions">
                            <a v-if='props.row.method == "get" && IS_CRUDABLE(props.row.path,props.row.method)' href="#" @click.prevent='showSelectEntryPointModal(props.row.path,props.row.method)' data-toggle="tooltip" data-placement="top" title="CRUD" class="btn btn-sm btn-secondary btn-action">
                                <i class="fas fa-table"></i>
                            </a>
                            <a v-if='props.row.method == "get"' href="" @click.prevent='handleFormView(props.row.path,props.row.method)' data-toggle="tooltip" data-placement="top" title="Form-view" class="btn btn-sm btn-secondary btn-action">
                                <i class="fab fa-wpforms"></i>
                            </a>
                            <a v-if='props.row.method == "post"' href="" @click.prevent='initPost(props.row.path,props.row.method)' data-toggle="tooltip" data-placement="top" title="Post" class="btn btn-sm btn-primary btn-action">
                                <i class="fas fa-chevron-right"></i>
                            </a>
                            <a v-if='props.row.method == "delete"' href="" @click.prevent='handleDelete(props.row.path,props.row.method)' data-toggle="tooltip" data-placement="top" title="Delete" class="btn btn-sm btn-danger btn-action">
                                <i class="fas fa-trash-alt"></i>
                            </a>
                        </div>
                    </span>

                    <span v-else>
                        {{props.formattedRow[props.column.field] }}
                    </span>
                </template>

                </vue-good-table>

                <SelectEntryPointModal :table-index='propIndex'
                                       :show-modal='showModal'
                                       :response='response'
                                       :parameters="parameters"
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
                                :parameters="parameters"
                                @closeModal="showDeleteModal=false"
                                @trigger-delete="triggerDelete"/>

                </div>
                <div v-show='deleteError!=="" || deleteSuccess!==""' class="card-footer">
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
            <br>
        </div>
    </template>


    <script>
    import { mapMutations,mapGetters } from 'vuex'
    import Tag from './tag/Tag.vue';
    import SelectEntryPointModal from './modals/SelectEntryPointModal.vue';
    import FormViewParametersModal from './modals/FormViewParametersModal.vue';
    import DeleteModal from './modals/DeleteModal.vue';

    const _ = require("lodash")

    export default {

        props: ['group','propIndex'],
        data: function () {
            return {
                showModal: false,
                showFormViewModal: false,
                showDeleteModal:false,
                columns: [
                    {
                        label: 'Path',
                        field: 'path',
                    },
                    {
                        label: 'Method',
                        field: 'method',
                    },
                    {
                        label: 'Actions',
                        field: 'btn',
                        sortable: false,
                    },
                ],
                rows: [],
                response: {},
                request_body: {},
                parameters: [],
                selectedPath: '',
                selectedMethod: '',
                deleteSuccess:"",
                deleteError:""
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
        },
        methods: {
            showSelectEntryPointModal(path,method) {
                this.response = this.getResponseByPathAndMethod(path,method);
                this.parameters = this.getParametersByPathAndMethod(path,method);
                this.selectedPath = path;
                this.selectedMethod = method;
                this.showModal = true;
            },
            handleFormView(path,method) {
                this.parameters = this.getParametersByPathAndMethod(path,method);
                if (this.parameters.length > 0) {
                    this.selectedPath = path;
                    this.selectedMethod = method;
                    this.showFormViewModal = true;
                } else{
                    console.log("navigate to form view");
                }
            },
            handleDelete(path,method) {
                this.parameters = this.getParametersByPathAndMethod(path,method);
                if (this.parameters.length > 0) {
                    this.selectedPath = path;
                    this.selectedMethod = method;
                    this.showDeleteModal = true;
                } else{
                    this.triggerDelete(this.SERVER_URL+path);
                }
            },
            triggerDelete(url) {
                this.showDeleteModal = false;
                axios.delete(url)
                .then((response) => {
                    this.deleteError = "";
                    this.deleteSuccess = JSON.stringify(response.data);
                })
                .catch((error) => {
                    this.deleteSuccess = "";
                    this.deleteError = JSON.stringify(error.response.data);
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
            startCrud(payload) {
                this.showModal = false;
                // next tick wait until the current DOM updates and then exeutes the function
                this.$nextTick(function () {
                    this.$router.push({ name: 'crud', params: payload});
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
            }
        },
        computed: {
            ...mapGetters([
            "getTagByName",
            "getResponseByPathAndMethod",
            "getParametersByPathAndMethod",
            "getRequestByPathAndMethod",
            "IS_CRUDABLE",
            "SERVER_URL"
            ]),
            tag(){
                return this.getTagByName(this.group.tag_name);
            }

        }
    }

</script>
