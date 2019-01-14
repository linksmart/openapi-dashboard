<template >
    <div>
        <div class="modal fade" ref='selectArrayModal' tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" >
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Request parameters for "{{path}}" ({{method}})</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="$emit('closeModal')">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <vue-bootstrap4-form-generator :model="req_params_model"
                                                       :schema="req_params_schema"
                                                       :defaults="req_params_defaults" />

                    </div>
                    <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click='goToFormView'>Finish</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>

    import VueBootstrap4FormGenerator from "vue-bootstrap4-form-generator"
    var URI = require('urijs');
    var URITemplate = require('urijs/src/URITemplate');

    export default {
        props: ['showModal','serverUrl','path','method','tableIndex','parameters'],
        data: function () {
            return {
                json_path:'',
                entry_path:'',
                clean_data_entry_path:'',
                entry_data: {},
                entry_data_properties: {},
                selected_attributes:[],
                req_params_model: {},
                req_params_schema: {},
                req_params_defaults: {},

                parameter_form_invalid: false,
            }
        },
        mounted(){
            $(this.$refs.selectArrayModal).on('hidden.bs.modal', function (e) {
                this.$emit('closeModal');
            }.bind(this));

            this.req_params_model = this.generateReqParamModel(this.parameters);
        },
        components: {
            VueBootstrap4FormGenerator
        },
        methods: {
            goToFormView() {
                this.$emit('go-to-form-view',this.fullUrl);
            },
            removeFirstDot(path) {
                if (_.isEmpty(path)) {
                    return '';
                } else if (path.charAt(0) === '.') {
                    return path.substr(1);
                } else {
                    return path;
                }
            },
            generateReqParamModel(parameters) {
                let model = {};
                let self = this;
                let allowed_params = ["path","query"];
                _.forEach(parameters,function(parameter,key){
                    if (!_.includes(allowed_params,parameter.in)) {
                        return;
                    }
                    model[parameter.name] = "";
                });
                return model;
            },
            makeSchema(key, value) {

                if (typeof value == "object" && !Array.isArray(value)) {
                    let obj = {
                        type: "Object",
                        name: key,
                        elements: []
                    }
                    _.forEach(value, function (value, key) {
                        let result = this.makeSchema(key, value);
                        obj.elements.push(result);
                    }.bind(this));
                    return obj;

                } else if (typeof value == "string") {
                    let element = {
                        label: key,
                        name: key,
                        element_type: "input",
                        type: "text",
                        placeholder: ("Enter " + key)
                    };
                    return element;
                } else if (typeof value == "number") {
                    let element = {
                        label: key,
                        name: key,
                        element_type: "input",
                        type: "number",
                        placeholder: ("Enter " + key)
                    };
                    return element;
                } else if (typeof value == "boolean") {
                    let element = {
                        label: key,
                        name: key,
                        element_type: "input",
                        type: "checkbox",
                        placeholder: ""
                    };
                    return element;
                } else if (Array.isArray(value)) {
                    let obj = {
                        type: "Array",
                        name: key,
                        schema: {}
                    }
                    let result = this.makeSchema(null, value[0]);
                    if (typeof value[0] == "object") {
                        obj.schema = result;
                    } else {
                        obj.schema.type = "input";
                        obj.schema.element = result;
                    }
                    return obj;
                }
            },

        },
        computed: {
            fullUrl() {


                let uriParams = {};
                let queryParams = {};
                let uriPath = '';
                let fullPath = "";

                this.parameters.forEach((param,key) => {
                    if (param.in === 'path') {
                        uriParams[param.name] = this.req_params_model[param.name];
                    } else if (param.in === 'query') {
                        queryParams[param.name] = this.req_params_model[param.name];
                    }
                });


                if (!_.isEmpty(uriParams)) {
                    uriPath = URITemplate(this.path).expand(uriParams);
                }

                if (_.isEmpty(uriPath)) {
                    fullPath = this.serverUrl+this.path;
                } else {
                    fullPath = this.serverUrl+uriPath;
                }

                fullPath = new URI(fullPath).addQuery(queryParams).toString();
                return fullPath

            }
        },
        watch: {
            showModal: function (val) {
                if (val) {
                    $(this.$refs.selectArrayModal).modal('show');
                } else {
                    // this.resetData();
                    $(this.$refs.selectArrayModal).modal('hide');
                }
            },
            parameters: {
                handler: function(newValue) {
                    this.req_params_model = this.generateReqParamModel(this.parameters);
                    this.req_params_schema = this.makeSchema(null,this.req_params_model);
                    this.req_params_defaults = _.cloneDeep(this.req_params_model);
                    // this.model = this.generateModel(this.parameters);
                    // this.schema = this.generateSchema(this.parameters);
                },
                deep: true
            }
        }
    }

</script>
