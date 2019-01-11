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
                            <a v-if='props.row.method == "get"' href="#" @click.prevent='showFormViewModal(props.row.path,props.row.method)' data-toggle="tooltip" data-placement="top" title="Form-view" class="btn btn-sm btn-secondary btn-action">
                                <i class="fab fa-wpforms"></i>
                            </a>
                            <a v-if='props.row.method == "post"' href="#" @click.prevent='initPostModal(props.row.path,props.row.method)' data-toggle="tooltip" data-placement="top" title="POST" class="btn btn-sm btn-primary btn-action">
                                <i class="fas fa-chevron-right"></i>
                            </a>
                        </div>
                    </span>

                    <span v-else>
                        {{props.formattedRow[props.column.field] }}
                    </span>
                </template>

                </vue-good-table>

                <SelectEntryPointModal :table-index='propIndex' :show-modal='showModal' :response='response' :parameters="parameters" :path='selectedPath' :method='selectedMethod' @closeModal="showModal=false" @startCrud="startCrud" @clearParameters="parameters=[]"/>
                <PostModal :table-index='propIndex' :show-modal='showPostModal' :request-body='request_body' :path='selectedPath' :method='selectedMethod' @closeModal="showPostModal=false"/>
                </div>
            </div>
            <br>
        </div>
    </template>


    <script>
    import { mapMutations,mapGetters } from 'vuex'
    import Tag from './tag/Tag.vue';
    import SelectEntryPointModal from './modals/SelectEntryPointModal.vue';
    import PostModal from './modals/PostModal.vue';

    const _ = require("lodash")

    export default {

        props: ['group','propIndex'],
        data: function () {
            return {
                showModal: false,
                showFormViewModal: false,
                showPostModal: false,
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
            }
        },
        mounted(){
            this.rows = this.group.paths;
        },
        components: {
            Tag,
            SelectEntryPointModal,
            PostModal
        },
        methods: {
            showSelectEntryPointModal(path,method) {
                this.response = this.getResponseByPathAndMethod(path,method);
                this.parameters = this.getParametersByPathAndMethod(path,method);
                this.selectedPath = path;
                this.selectedMethod = method;
                this.showModal = true;
            },
            showFormViewModal(path,method) {
                this.response = this.getResponseByPathAndMethod(path,method);
                this.parameters = this.getParametersByPathAndMethod(path,method);
                this.selectedPath = path;
                this.selectedMethod = method;
                this.showFormViewModal = true;
            },
            initPostModal(path,method) {
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
            }
        },
        computed: {
            ...mapGetters([
            "getTagByName",
            "getResponseByPathAndMethod",
            "getParametersByPathAndMethod",
            "getRequestByPathAndMethod",
            "IS_CRUDABLE"
            ]),
            tag(){
                return this.getTagByName(this.group.tag_name);
            }

        }
    }

</script>
