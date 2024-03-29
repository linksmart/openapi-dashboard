<template>
<div class="container-fluid">

    <div class="card" v-if="request_parameters">
        <div class="card-header">
            Params form
        </div>
        <div class="card-body">
            <vue-bootstrap4-form-generator :model="req_params_model" :schema="req_params_schema" :defaults="req_params_defaults" />
        </div>
    </div>

    <br>

    <div class="card">
        <div class="card-header">
            Post form
        </div>
        <div class="card-body">
            <vue-bootstrap4-form-generator :model="model" :schema="schema" :defaults="defaults" />
            <br>
            <button type="button" class="btn btn-primary" @click="postForm">Post</button>
        </div>
        <div class="card-footer" v-show=' post_error !== "" || post_success !== ""'>
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
            test: {}
        }
    },
    mounted() {
        this.requestBody = this.$route.params.request_body;
        this.selectedMethod = this.$route.params.selectedMethod;
        this.selectedPath = this.$route.params.selectedPath;
        this.request_parameters = this.$route.params.request_parameters;
        this.transfromToModel();
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
                if (response.status >= 200 && response.status < 230) {
                    self.showSuccess("Successful")
                    if (response.data && !_.isEmpty(response.data)) {
                        self.post_success = response.data;
                    } else {
                        self.post_success = "Successful";
                    }
                    self.post_error = "";
                }
            })
            .catch(function (error) {
                self.post_success = "";
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
                    //    console.log(result);

                    self.model = _.cloneDeep(result[0].pepper);
                    self.defaults = _.cloneDeep(result[0].pepper);
                    self.schema = _.cloneDeep(result[1].pepper);
                } else if (
                    this.requestBody.content["application/json"].schema.type == "array"
                ) {
                    let result = self.makeModel(
                        "pepper",
                        this.requestBody.content["application/json"].schema
                    );
                    //    console.log(result);

                    self.model = _.cloneDeep(result[0].pepper);
                    self.defaults = _.cloneDeep(result[0].pepper);
                    self.schema = _.cloneDeep(result[1].pepper);
                }
            } else {
                console.log("json schema not found");
            }
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
                let schemaObj = {};
                schemaObj[salt] = {
                    type: "Object",
                    name: salt,
                    canRemove: true,
                    canDuplicate: true,
                    canAddProperty: true,
                    elements: []
                }

                _.forEach(pepper.properties, function (value, key) {
                    if (value.type == "object" || value.type == "array") {
                        let result = self.makeModel(key, value);
                        obj[salt][key] = result[0][key];
                        schemaObj[salt].elements.push(result[1][key]);
                    } else {
                        let result = self.makeModel(key, value);
                        obj[salt][key] = result[0];
                        schemaObj[salt].elements.push(result[1]);
                    }
                });

                return [obj,schemaObj];
            }

            if (pepper.type == "string") {
                let element = {
                    label: salt,
                    name: salt,
                    canRemove: true,
                    readonly : pepper.readOnly,
                    element_type: "input",
                    type: "text",
                    placeholder: ("Enter " + salt)
                };
                return ["",element];
            }

            if (pepper.type == "integer" || pepper.type == "number") {
                let element = {
                    label: salt,
                    name: salt,
                    canRemove: true,
                    element_type: "input",
                    type: "number",
                    placeholder: ("Enter " + salt)
                };
                return [0,element];
            }

            if (pepper.type == "boolean") {
                let element = {
                    label: salt,
                    name: salt,
                    canRemove: true,
                    element_type: "input",
                    type: "checkbox",
                    placeholder: ""
                };
                return [false,element];
            }

            if (pepper.type == "array") {
                let arraySchemaobj = {
                    type: "Array",
                    name: salt,
                    canAdd: true,
                    canRemove: true,
                    schema: {}
                }
                if (pepper.items.type == "object") {
                    let obj = {};
                    let schemaObj = {
                        type: "Object",
                        name: salt,
                        canRemove: true,
                        canDuplicate: true,
                        canAddProperty: true,
                        elements: []
                    }
                    _.forEach(pepper.items.properties, function (value, key) {
                        let result = self.makeModel(key, value);
                        obj[key] = result[0];
                        schemaObj.elements.push(result[1]);
                    });
                    arraySchemaobj.schema = schemaObj;
                    return [{
                        [salt]: [obj]
                    },{
                        [salt]: arraySchemaobj
                    }];
                } else if (pepper.items.type == "string") {
                    let element = {
                        label: salt,
                        canRemove: true,
                        name: salt,
                        element_type: "input",
                        type: "text",
                        placeholder: ("Enter " + salt)
                    };
                    arraySchemaobj.schema.type = "input";
                    arraySchemaobj.schema.element = element;
                    return [
                        [""],arraySchemaobj
                    ];
                } else if (pepper.items.type == "integer" || pepper.type == "number") {
                    let element = {
                        label: salt,
                        name: salt,
                        canRemove: true,
                        element_type: "input",
                        type: "number",
                        placeholder: ("Enter " + salt)
                    };
                    arraySchemaobj.schema.type = "input";
                    arraySchemaobj.schema.element = element;
                    return [
                        [0],arraySchemaobj
                    ];
                } else if (pepper.type == "boolean") {
                    let element = {
                        label: salt,
                        name: salt,
                        canRemove: true,
                        element_type: "input",
                        type: "checkbox",
                        placeholder: ""
                    };
                    arraySchemaobj.schema.type = "input";
                    arraySchemaobj.schema.element = element;
                    return [
                        [false],
                        arraySchemaobj
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
            'SERVER_URL',
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
                return this.SERVER_URL+this.selectedPath;
            } else {
                return this.SERVER_URL+uriPath;
            }

        }
    },
}
</script>
