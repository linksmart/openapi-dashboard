<template >
    <div class="container-fluid">
        <div class="card">
            <div class="card-body">
                <vue-good-table
                :columns="columns"
                :rows="rows">

                <div slot="table-actions">
                    <button type="button" class="btn btn-primary mr-1" @click="showModal = true">Update attributes</button>
                </div>

                </vue-good-table>
                <SelectAttributesModal :show-modal='showModal' :selected-attributes='selected_attributes' :entry-data-properties='entry_data_properties' @closeModal="showModal=false" @updateAttributes="updateAttributes"/>
            </div>
        </div>
    </div>
</template>


<script>
import axios from 'axios';
import { mapMutations,mapGetters } from 'vuex';
var URI = require('urijs');
var URITemplate = require('urijs/src/URITemplate');
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
            url:'http://localhost:3000/assets/json/openapi.json',
            method:"",
            path:"",
            entry_data_path:"",
            selected_attributes: this.$route.params.selected_attributes,
            entry_data_properties: this.$route.params.entry_data_properties,
            request_params: this.$route.params.request_params,
            rows: [],
            columns: [],
            data: [],
            showModal: false,
        }
    },
    components: {
        SelectAttributesModal
    },
    mounted(){
        this.method = this.$route.params.method;
        this.path = this.$route.params.path;
        this.entry_data_path = this.$route.params.entry_data_path;
        this.getData();
        this.generateColumns();
        this.generateRows();
    },
    methods: {
        getData() {
            let self = this;
            axios.get(this.fullUrl)
            .then(function (response) {
                self.data = _.get(response,"data."+self.entry_data_path);
                self.generateRows(self.data);
            });
        },
        generateColumns() {
            let columns = [];
            let self = this;
            _.forEach(this.selected_attributes,function(selected_attribute,key) {
                columns.push({
                    label: selected_attribute.data_path,
                    field: selected_attribute.data_path,
                });
            });
            this.columns = columns ;
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
        ]),
        fullUrl() {
            let params = {};
            let uriPath = '';

            _.forEach(this.request_params,function(param,key) {
                if (param.type === 'path') {
                    params[key] = param.value;
                }
            });

            if (!_.isEmpty(params)) {
                uriPath = URITemplate(this.path).expand(params);
            }

            if (_.isEmpty(uriPath)) {
                return this.SERVER_URL+this.path;
            } else {
                return this.SERVER_URL+uriPath;
            }

        }
    }
}
</script>
