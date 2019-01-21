<template >
    <vue-bootstrap4-form-generator :model="req_params_model"
                                    :schema="req_params_schema"
                                    :defaults="req_params_defaults" />
</template>


<script>

    import VueBootstrap4FormGenerator from "vue-bootstrap4-form-generator"
    var URI = require('urijs');
    var URITemplate = require('urijs/src/URITemplate');

    export default {
        name: "RequestParametersForm",
        props: ['serverUrl','path','parameters'],
        data: function () {
            return {
                req_params_model: {},
                req_params_schema: {},
                req_params_defaults: {},
            }
        },
        mounted(){
            $(this.$refs.selectArrayModal).on('hidden.bs.modal', function (e) {
                this.$emit('closeModal');
            }.bind(this));

            this.req_params_model = this.generateReqParamModel(this.parameters);
            this.req_params_schema = this.makeSchema(null,this.req_params_model);
            this.req_params_defaults = _.cloneDeep(this.req_params_model)
        },
        components: {
            VueBootstrap4FormGenerator
        },
        methods: {
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
                let uriPath = "";
                let fullPath = "";

                if (!_.isEmpty(this.uriParams)) {
                    uriPath = URITemplate(this.path).expand(this.uriParams);
                }

                if (_.isEmpty(uriPath)) {
                    fullPath = this.url;
                } else {
                    fullPath = this.serverUrl+uriPath;
                }

                fullPath = new URI(fullPath).addQuery(this.queryParams).toString();
                return fullPath;
            },
            url() {
                return this.serverUrl + this.path;
            },
            uriParams() {
                let uriParams = {};
                this.parameters.forEach((param,key) => {
                    if (param.in === 'path') {
                        uriParams[param.name] = this.req_params_model[param.name];
                    }
                });
                return uriParams;
            },
            queryParams() {
                let queryParams = {};
                this.parameters.forEach((param,key) => {
                    if (param.in === 'query') {
                        queryParams[param.name] = this.req_params_model[param.name];
                    }
                });
                return queryParams;
            },
        },
        watch: {
            parameters: {
                handler: function(newValue) {
                    this.req_params_model = this.generateReqParamModel(this.parameters);
                    this.req_params_schema = this.makeSchema(null,this.req_params_model);
                    this.req_params_defaults = _.cloneDeep(this.req_params_model);
                },
                deep: true
            },
            fullUrl(newval,oldVal) {
                // this.$emit("update:fullUrl", this.fullUrl);
                // this.$emit("update:url", this.url);
                this.$emit("on-request-params-change", {
                    fullUrl : this.fullUrl,
                    url : this.url,
                    uriParams : _.cloneDeep(this.uriParams),
                    queryParams : _.cloneDeep(this.queryParams)
                });
            }
        }
    }

</script>
