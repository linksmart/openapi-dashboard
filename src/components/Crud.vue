<template >
    <div class="container-fluid">
        <div class="card">
            <!-- <div class="card-body">
                <vue-good-table
                :columns="columns"
                :rows="rows">

                <div slot="table-actions">
                    <button type="button" class="btn btn-primary mr-1" @click="showModal = true">Update attributes</button>
                </div>

                </vue-good-table> -->
                <vue-bootstrap4-table :columns="columns"
                                      :config="config"
                                      :rows="rows"
                                      :actions="actions"
                                      @on-update-columns="showModal = true"
                                      @on-change-query="onChangeQuery"
                                      :totalRows="totalRows">
                </vue-bootstrap4-table>

                <SelectAttributesModal :show-modal='showModal' :selected-attributes='selected_attributes' :entry-data-properties='entry_data_properties' @closeModal="showModal=false" @updateAttributes="updateAttributes"/>
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

var _ = {
  forEach: require('lodash/forEach'),
  get: require('lodash/get'),
  findIndex: require('lodash/findIndex'),
  isEmpty: require('lodash/isEmpty'),
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
            selected_attributes: this.$route.params.selected_attributes,
            entry_data_properties: this.$route.params.entry_data_properties,
            request_params: this.$route.params.request_params,
            rows: [],
            columns: [],
            data: [],
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
                },
                {
                    btn_text: "Update Columns",
                    event_name: "on-update-columns"
                },
                {
                    btn_text: "Update Columns",
                    event_name: "on-update-columns"
                },
            ],
        }
    },
    components: {
        SelectAttributesModal,
        VueBootstrap4Table
    },
    mounted(){
        this.method = this.$route.params.method;
        this.fullUrl = this.$route.params.fullUrl;
        this.url = this.$route.params.url;
        this.entry_data_path = this.$route.params.entry_data_path;
        this.requestQueryParams = this.$route.params.queryParams;
        this.uriParams = this.$route.params.uriParams;
        if (this.requestQueryParams.per_page) {
            // this.config.per_page = this.requestQueryParams.per_page;
            // this.config.page = this.requestQueryParams.page;
        }
        console.log('mounted');

        this.getData(this.fullUrl);
        this.generateColumns();
        this.generateRows();
    },
    methods: {
        getData(url) {
            console.log(url);
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
        ])
    }
}
</script>
