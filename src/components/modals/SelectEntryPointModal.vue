<template >
    <div>
        <div class="modal fade" ref='selectArrayModal' tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" >
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Select the data entry point for "{{path}}" ({{method}})</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="$emit('closeModal')">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-pills mb-3" role="tablist" :id="'nav-tab-items-'+tableIndex">
                            <li class="nav-item">
                                <a class="nav-link rounded-circle active" :id="'entry-path-selector-'+tableIndex" data-toggle="pill" :href="'#pills-entry-path-'+tableIndex" role="tab" :aria-controls="'pills-entry-path-'+tableIndex" aria-selected="true">1</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link rounded-circle" :class = "(isValidEntryData)?'':'disabled'" :id="'attribute-selector-'+tableIndex" data-toggle="pill" :href="'#pills-attribute-selector-'+tableIndex" role="tab" :aria-controls="'pills-attribute-selector-'+tableIndex" aria-selected="false">2</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link rounded-circle" :class = "(isValidEntryData)?'':'disabled'" :id="'request-params-'+tableIndex" data-toggle="pill" :href="'#pills-request-params-'+tableIndex" role="tab" :aria-controls="'pills-request-params-'+tableIndex" aria-selected="false">3</a>
                            </li>
                        </ul>
                        <div class="tab-content">
                            <div class="tab-pane fade show active" :id="'pills-entry-path-'+tableIndex" role="tabpanel" :aria-labelledby="'entry-path-selector-'+tableIndex">
                                <vue-json-pretty
                                path=''
                                :data="response_content"
                                selectableType='tree'
                                :deep=4
                                :showLength=true
                                @click="entryPointSelector">
                            </vue-json-pretty>

                            Entry point : {{cleanEntryPoint}}
                            <small v-show='isValidEntryData' class="form-text text-success">Valid entry path</small>
                            <small v-show='!isValidEntryData' class="form-text text-danger">Invalid entry path (Select a property with type "array")</small>
                        </div>
                        <div class="tab-pane fade" :id="'pills-attribute-selector-'+tableIndex" role="tabpanel" :aria-labelledby="'attribute-selector-'+tableIndex">
                            <SelectAttributes :selected-attributes='selected_attributes' :entry-data-properties='entry_data_properties' @addAttribute="addAttribute(...arguments)" @removeAttribute="removeAttribute(...arguments)" @setRootId="setRootId(...arguments)"/>
                        </div>
                        <div class="tab-pane fade" :id="'pills-request-params-'+tableIndex" role="tabpanel" :aria-labelledby="'request-params-'+tableIndex">
                            <div class="row">
                                <div class="col-md-6">
                                    <request-parameters-form :parameters="parameters"
                                                                :server-url="serverUrl"
                                                                :path="path"
                                                                :fullUrl.sync="fullUrl" />
                                    <!-- <vue-form-generator :schema="schema" :model="model" :options="formOptions" @validated="onValidated"></vue-form-generator> -->
                                </div>
                            </div>
                            <br>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <!-- <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="$emit('closeModal')">Close</button> -->
                    <button v-show='!is_first_tab' class="btn btn-info" @click='previous'>Previous</button>
                    <button v-show='!is_last_tab' class="btn btn-info" @click='next'>Next</button>
                    <!-- <router-link class="btn btn-primary" :to="{ name: 'test', params: { selected_attributes } }">
                    Start crud
                </router-link> -->
                <button type="button" :disabled='!isValidEntryData || parameter_form_invalid || selected_attributes.length == 0' class="btn btn-primary" @click='startCrud'>Start CRUD</button>
            </div>
        </div>
    </div>
</div>
</div>
</template>


<script>
    import VueJsonPretty from 'vue-json-pretty';
    import VueFormGenerator from "vue-form-generator";
    import SelectAttributes from '../SelectAttributes.vue';
    import RequestParametersForm from '../RequestParametersForm.vue';

    var _ = {
        isEmpty: require('lodash/isEmpty'),
        find: require('lodash/find'),
        has: require('lodash/has'),
        forEach: require('lodash/forEach'),
        findIndex: require('lodash/findIndex'),
        isObject: require('lodash/isObject'),
        includes: require('lodash/includes'),
    };
    export default {
        props: ['showModal','response','path','method','tableIndex','parameters','serverUrl'],
        data: function () {
            return {
                json_path:'',
                entry_path:'',
                clean_data_entry_path:'',
                response_content: {},
                entry_data: {},
                entry_data_properties: {},
                selected_attributes:[],
                model: {},

                schema: {
                    fields: []
                },

                formOptions: {
                    validateAfterLoad: true,
                    validateAfterChanged: true,
                    fieldIdPrefix: "table_" + this.tableIndex + "_"
                },

                parameter_form_invalid: false,
                is_first_tab: true,
                is_last_tab: false,
                fullUrl: "",
            }
        },
        mounted(){
            $(this.$refs.selectArrayModal).on('hidden.bs.modal', function (e) {
                this.$emit('closeModal');
            }.bind(this));
            this.model = this.generateModel(this.parameters);
            this.schema = this.generateSchema(this.parameters);

            let self = this;
            $(`#nav-tab-items-${this.tableIndex} a[data-toggle="pill"]`).on('shown.bs.tab', function (e) {
                if ($(e.target).parent().next('li').index() < 0) {
                    self.is_last_tab = true;
                    self.is_first_tab = false;
                } else if ($(e.target).parent().prev('li').index() < 0) {
                    self.is_first_tab = true;
                    self.is_last_tab = false;
                } else {
                    self.is_first_tab = false;
                    self.is_last_tab = false;
                }
            });
        },
        components: {
            VueJsonPretty,
            "vue-form-generator": VueFormGenerator.component,
            SelectAttributes,
            RequestParametersForm
        },
        methods: {
            onValidated(isValid, errors) {
                this.parameter_form_invalid = !isValid;
            },
            next(){
                if (this.isValidEntryData) {
                    $(`#nav-tab-items-${this.tableIndex} a.active`).parent().next('li').find('a').trigger('click');
                }
            },
            previous(){
                $(`#nav-tab-items-${this.tableIndex} a.active`).parent().prev('li').find('a').trigger('click');
            },
            generateSchema(parameters) {
                let fields = [];
                let self = this;
                let allowed_params = ["path","query"];
                _.forEach(parameters,function(parameter,key){
                    if (!_.includes(allowed_params,parameter.in)) {
                        return;
                    }
                    let inputType = "text";

                    if (_.has(parameter,"schema")) {
                        if (parameter.schema.type === "number") {
                            inputType = "number";
                        }
                    }

                    let validator = null;
                    if (parameter.required) {
                        if (parameter.schema.type === "number") {
                            validator = VueFormGenerator.validators.integer;
                        } else {
                            validator = VueFormGenerator.validators.string;
                        }
                    }

                    fields.push({
                        type: "input",
                        inputType: inputType,
                        label: parameter.name,
                        model: (parameter.name + '.value'),
                        required: parameter.required,
                        validator: validator
                    });
                });
                return {"fields":fields};
            },
            generateModel(parameters) {
                let model = {};
                let self = this;
                let allowed_params = ["path","query"];
                _.forEach(parameters,function(parameter,key){
                    if (!_.includes(allowed_params,parameter.in)) {
                        return;
                    }
                    model[parameter.name] = {};
                    model[parameter.name]['type'] = parameter.in;
                    model[parameter.name]['value'] = "";
                    if (_.has(parameter,"schema")) {
                        if (parameter.schema.type === "number") {
                            model[parameter.name]['value'] = 0;
                        }
                    }
                });
                return model;
            },
            removeAttribute(config_path){
                let index = _.findIndex(this.selected_attributes, { 'config_path': config_path});
                if (index > -1) {
                    this.selected_attributes.splice(index,1);
                } else {
                    this.showError('Attribute not found')
                }
            },
            addAttribute(name,config_path,data_path,type){
                this.selected_attributes.push({
                    name: name,
                    config_path: config_path,
                    data_path: data_path,
                    type: type,
                    isRoot: false
                });
                this.showSuccess('"'+ name + '" attribute added successfully');
            },
            entryPointSelector(entry_path,entry_data) {
                this.entry_path = entry_path;
                this.entry_data = entry_data;
            },
            setRootId(selected_attribute) {
                let self = this;
                _.forEach(this.selected_attributes,function(value,key) {
                    if (value.config_path !== selected_attribute.config_path) {
                        self.selected_attributes[key].isRoot = false;
                    }
                });
            },
            startCrud() {
                this.$emit('startCrud',{
                    selected_attributes: this.selected_attributes,
                    entry_data_properties: this.entry_data_properties,
                    fullUrl: this.fullUrl,
                    method: this.method,
                    entry_data_path: this.clean_data_entry_path,
                    request_params: this.model
                });
            },
            resetData() {
                this.entry_path = '';
                this.entry_data = {};
                this.response_content = {};
                this.entry_data_properties = {};
                this.selected_attributes = [];
                $('#nav-tab-items-'+ this.tableIndex + ' li:first-child a').tab('show');
                this.$emit("clearParameters");
            },
            removeFirstDot(path) {
                if (_.isEmpty(path)) {
                    return '';
                } else if (path.charAt(0) === '.') {
                    return path.substr(1);
                } else {
                    return path;
                }
            }

        },
        computed: {
            isValidEntryData() {
                if (_.isEmpty(this.entry_data) || !_.has(this.entry_data,'type') || this.entry_data.type !== 'array') {
                    return false;
                }
                return true;
            },
            cleanEntryPoint() {
                return this.removeFirstDot(this.entry_path);
            },
        },
        watch: {
            showModal: function (val) {
                if (val) {
                    this.response_content = this.response.content;
                    $(this.$refs.selectArrayModal).modal('show');
                } else {
                    this.resetData();
                    $(this.$refs.selectArrayModal).modal('hide');
                }
            },
            entry_data: {
                handler: function(newValue) {
                    if (!this.isValidEntryData) {
                        // this.entry_data_properties = this.entry_data.items.properties;
                        this.entry_data_properties = {}
                    } else {
                        this.entry_data_properties = this.entry_data.items.properties;
                    }
                    this.selected_attributes = [];
                },
                deep: true
            },
            parameters: {
                handler: function(newValue) {
                    this.model = this.generateModel(this.parameters);
                    this.schema = this.generateSchema(this.parameters);
                },
                deep: true
            },
            entry_data_properties: {
                handler: function(newValue) {
                    this.selected_attributes = [];
                },
                deep: true
            },
            entry_path(val) {
                let path = this.removeFirstDot(val);
                let result = path.split(".");
                result.splice(0,1);
                path = result.join(".");
                if (_.includes(path,"schema.properties")) {
                    path = path.replace(/schema.properties./gi,'');
                }
                if (_.includes(path,".items.properties")) {
                    path = path.replace(/.items.properties./gi,'.');
                }
                this.clean_data_entry_path = path;
            },
        }
    }

</script>
