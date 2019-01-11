<template>
<div class="container-fluid">
    <div class="card">
        <div class="card-header">
            <ul class="nav nav-pills mb-3" role="tablist" id="nav-tab-items">
                <li class="nav-item">
                    <a class="nav-link active" id="post_form" data-toggle="pill" href="#pills-post-form" role="tab" aria-controls="pills-post-form" aria-selected="true">Post form</a>
                </li>
                <li class="nav-item" v-if="request_parameters">
                    <a class="nav-link" id="param_form" data-toggle="pill" href="#pills-param-form" role="tab" aria-controls="pills-param-form" aria-selected="true">Params form</a>
                </li>
            </ul>
        </div>
        <div class="card-body">
            <div class="tab-content">
                <div class="tab-pane fade show active" id="pills-post-form" role="tabpanel" aria-labelledby="post_form">
                    <vue-bootstrap4-form-generator :model="model" :schema="schema" :defaults="defaults" />
                </div>
                <div v-if="request_parameters" class="tab-pane fade show" id="pills-param-form" role="tabpanel" aria-labelledby="param_form">
                    <vue-bootstrap4-form-generator :model="req_params_model" :schema="req_params_schema" :defaults="req_params_defaults" />
                </div>
            </div>
            <br>
            <button type="button" class="btn btn-primary" @click="postForm">Post</button>
        </div>
        <div class="card-footer">
            <div v-if='post_error !== ""' class="alert alert-danger" role="alert">
                <strong>{{post_error}}</strong>
            </div>
            <div v-if='post_success !== ""' class="alert alert-success" role="alert">
                <strong>{{post_success}}</strong>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import VueBootstrap4FormGenerator from "vue-bootstrap4-form-generator"
import { mapMutations,mapGetters } from 'vuex';
var URI = require('urijs');
var URITemplate = require('urijs/src/URITemplate');

export default {
    name: "Post",
    data() {
        return {
            requestBody: {},
            selectedMethod: "",
            selectedPath: "",
            request_parameters: [],
            schema: {},
            model: {},
            defaults: {},
            req_params_model: {},
            req_params_schema: {},
            req_params_defaults: {},
            post_error: "",
            post_success: "",
        }
    },
    mounted() {
        this.requestBody = this.$route.params.request_body;
        this.selectedMethod = this.$route.params.selectedMethod;
        this.selectedPath = this.$route.params.selectedPath;
        this.request_parameters = this.$route.params.request_parameters;
        this.transfromToModel();
        this.transformToSchema();
        this.req_params_model = this.generateReqParamModel(this.request_parameters);
        this.generateReqParamSchema();
        this.req_params_defaults = _.cloneDeep(this.req_params_model);

    },
    components: {
        VueBootstrap4FormGenerator
    },
    methods: {
        postForm() {
            let self = this;
            self.post_error = "";
            axios.post(this.fullUrl, this.model)
            .then(function (response) {
                if (response.status == 202 || response.status == 200) {
                    self.showSuccess("Successful")
                }

            })
            .catch(function (error) {
                self.post_error = error.response.data.message;
            })

        },
        transfromToModel() {
            let self = this;
            if (_.has(this.requestBody.content, "application/json.schema")) {
                if (
                    this.requestBody.content["application/json"].schema.type == "object"
                ) {
                    // console.log(self.makeModel('pepper', this.requestBody.content["application/json"].schema));
                    let result = self.makeModel(
                        "pepper",
                        this.requestBody.content["application/json"].schema
                    );
                    //    console.log(result[0]);

                    self.model = _.cloneDeep(result[0].pepper);
                    self.defaults = _.cloneDeep(result[0].pepper);
                    // self.schema = self.makeSchema(_.cloneDeep(result[0]));
                } else if (
                    this.requestBody.content["application/json"].schema.type == "array"
                ) {
                    let result = self.makeModel(
                        "pepper",
                        this.requestBody.content["application/json"].schema
                    );
                    // console.log(result[0]);
                    self.model = _.cloneDeep(result[0].pepper);
                    self.defaults = _.cloneDeep(result[0].pepper);
                    // self.schema = self.makeSchema(_.cloneDeep(result[0]));
                    // self.schema.fields.push(_.cloneDeep(result[1]));
                }
            } else {
                console.log("json schema not found");
            }
        },
        transformToSchema() {
            this.schema = this.makeSchema(null, this.model);
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
        makeModel(salt, pepper) {
            let self = this;
            if (pepper.type == "object") {
                let obj = {};
                obj[salt] = {};
                _.forEach(pepper.properties, function (value, key) {
                    if (value.type == "object" || value.type == "array") {
                        let result = self.makeModel(key, value);
                        obj[salt][key] = result[0][key];
                    } else {
                        let result = self.makeModel(key, value);
                        obj[salt][key] = result[0];
                    }
                });

                return [obj];
            }

            if (pepper.type == "string") {
                return [""];
            }

            if (pepper.type == "integer" || pepper.type == "number") {
                return [0];
            }

            if (pepper.type == "boolean") {
                return [false];
            }

            if (pepper.type == "array") {
                if (pepper.items.type == "object") {
                    let obj = {};
                    _.forEach(pepper.items.properties, function (value, key) {
                        let result = self.makeModel(key, value);
                        obj[key] = result[0];
                    });

                    return [{
                        [salt]: [obj]
                    }];
                } else if (pepper.items.type == "string") {
                    return [
                        [""]
                    ];
                } else if (pepper.items.type == "integer" || pepper.type == "number") {
                    return [
                        [0]
                    ];
                } else if (pepper.type == "boolean") {
                    return [
                        [false]
                    ];
                }
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
                // model[parameter.name] = {};
                // model[parameter.name]['type'] = parameter.in;
                model[parameter.name] = "";
                // if (_.has(parameter,"schema")) {
                //     if (parameter.schema.type === "number") {
                //         model[parameter.name]['value'] = 0;
                //     }
                // }
            });
            return model;
        },
        generateReqParamSchema() {
            this.req_params_schema = this.makeSchema(null,this.req_params_model);
        }
    },
    computed: {
        ...mapGetters([
            'ROOT_URL',
        ]),
        fullUrl() {
            let params = {};
            let uriPath = '';
            let self = this;

            _.forEach(this.request_parameters,function(param,key) {
                if (param.in === 'path') {
                    params[param.name] = self.req_params_model[param.name];
                }
            });

            if (!_.isEmpty(params)) {
                uriPath = URITemplate(this.selectedPath).expand(params);
            }

            if (_.isEmpty(uriPath)) {
                return this.ROOT_URL+this.selectedPath;
            } else {
                return this.ROOT_URL+uriPath;
            }

        }
    },
}
</script>
