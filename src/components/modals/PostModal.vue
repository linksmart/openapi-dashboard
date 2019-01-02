<template>
    <div>
        <div class="modal fade" ref="postModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{requestBody.description}}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="$emit('closeModal')">
                  <span aria-hidden="true">&times;</span>
                </button>
                    </div>
                    <div class="modal-body">
                    <vue-bootstrap4-form-generator :model="model" :schema="schema" :defaults="defaults">
                    </vue-bootstrap4-form-generator>
                        <!-- <vue-form-generator :schema="schema" :model="model" :options="formOptions" @validated="onValidated"></vue-form-generator> -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="$emit('closeModal')">Close</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="generateSchema">Generate Schema</button>
                        <!-- <button type="button" class="btn btn-primary" @click="updateAttributes">Update attributes</button> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    var _ = {
        isEmpty: require("lodash/isEmpty"),
        find: require("lodash/find"),
        has: require("lodash/has"),
        forEach: require("lodash/forEach"),
        findIndex: require("lodash/findIndex"),
        isObject: require("lodash/isObject"),
        includes: require("lodash/includes"),
        cloneDeep: require("lodash/cloneDeep")
    };

    import VueBootstrap4FormGenerator from "vue-bootstrap4-form-generator"

    export default {
        props: ["tableIndex", "requestBody", "showModal", "path", "method"],
        data: function() {
            return {
                schema: {},
                formOptions: {
                    validateAfterLoad: true,
                    validateAfterChanged: true,
                    fieldIdPrefix: "table_" + this.tableIndex + "_"
                },
                model: {},
                defaults: {},
            };
        },
        mounted() {
            $(this.$refs.postModal).on(
                "hidden.bs.modal",
                function(e) {
                    this.$emit("closeModal");
                }.bind(this)
            );
            let model = {
                    pepper: {
                        "id": "05bf9f68-96ac-40fb-be1c-35ff375d5583",
                        "url": "/registry/05bf9f68-96ac-40fb-be1c-35ff375d5583",
                        "data": "/data/05bf9f68-96ac-40fb-be1c-35ff375d5583",
                        "resource": "12/0/49/4/power",
                        "meta": {
                            "name": "Philip's computer"
                        },
                        "connector": {
                            "mqtt": {
                                "url": "tcp://linksmart-dev.fit.fraunhofer.de:1883",
                                "topic": "LS/v2/ZGW/linksmart-philip/senml",
                                "qos": 1
                            }
                        },
                        "retention": "1w",
                        "aggregation": [{
                            "id": "4efaf6fb",
                            "interval": "1m",
                            "data": "/aggr/4efaf6fb/05bf9f68-96ac-40fb-be1c-35ff375d5583",
                            "aggregates": [
                                "mean",
                                "mean 2"
                            ],
                            "retention": ""
                        },
                        {
                            "id": "4efaf6fb",
                            "interval": "1m",
                            "data": "/aggr/4efaf6fb/05bf9f68-96ac-40fb-be1c-35ff375d5583",
                            "aggregates": [
                                "mean"
                            ],
                            "retention": ""
                        }],
                        "type": "float",
                        "format": "application/senml+json"
                    }
                };
            // _.forEach(model,function(value,key) {
            //     let result = this.makeSchema(key,value);
            //     console.log(result);

            // }.bind(this));
        },
        components: {
            VueBootstrap4FormGenerator
        },
        methods: {
            onValidated(isValid, errors) {
                console.log(isValid);
            },

            generateSchema() {},

            // {
            //               type: "Object",
            //               elements: [
            //                   {
            //                       label: "ID",
            //                       name: "id",
            //                       element_type: "input",
            //                       type: "text",
            //                       placeholder: "Enter ID"
            //                   },
            //                   {
            //                       label: "URL",
            //                       name: "url",
            //                       element_type: "input",
            //                       type: "text",
            //                       placeholder: "Enter url"
            //                   },
            //                   {
            //                       label: "Data",
            //                       name: "data",
            //                       element_type: "input",
            //                       type: "text",
            //                       placeholder: "Enter data"
            //                   },
            //                   {
            //                       label: "Resource",
            //                       name: "resource",
            //                       element_type: "input",
            //                       type: "text",
            //                       placeholder: "Enter Resource"
            //                   },
            //                   {
            //                       type: "Object",
            //                       name: "meta",
            //                       elements: [
            //                           {
            //                               label: "Meta name",
            //                               name: "name",
            //                               element_type: "input",
            //                               type: "text",
            //                               placeholder: "Enter meta name"
            //                           },
            //                       ]
            //                   },
            //                   {
            //                       type: "Object",
            //                       name: "connector",
            //                       elements: [
            //                           {
            //                               type: "Object",
            //                               name: "mqtt",
            //                               elements: [
            //                                   {
            //                                       label: "URL",
            //                                       name: "url",
            //                                       element_type: "input",
            //                                       type: "text",
            //                                       placeholder: "Enter url"
            //                                   },
            //                                   {
            //                                       label: "Topic",
            //                                       name: "topic",
            //                                       element_type: "input",
            //                                       type: "text",
            //                                       placeholder: "Enter topic"
            //                                   },
            //                                   {
            //                                       label: "QOS",
            //                                       name: "qos",
            //                                       element_type: "input",
            //                                       type: "number",
            //                                       placeholder: "Enter qos"
            //                                   },
            //                               ]
            //                           },
            //                       ]
            //                   },
            //                   {
            //                       label: "Retention",
            //                       name: "retention",
            //                       element_type: "input",
            //                       type: "text",
            //                       placeholder: "Enter retention"
            //                   },
            //                   {
            //                       type: "Array",
            //                       name: "aggregation",
            //                       schema: {
            //                           type: "Object",
            //                           elements: [
            //                               {
            //                                   label: "ID",
            //                                   name: "id",
            //                                   element_type: "input",
            //                                   type: "text",
            //                                   placeholder: "Enter id"
            //                               },
            //                               {
            //                                   label: "Interval",
            //                                   name: "interval",
            //                                   element_type: "input",
            //                                   type: "text",
            //                                   placeholder: "Enter interval"
            //                               },
            //                               {
            //                                   label: "Data",
            //                                   name: "data",
            //                                   element_type: "input",
            //                                   type: "text",
            //                                   placeholder: "Enter data"
            //                               },
            //                               {
            //                                   type: "Array",
            //                                   name: "aggregates",
            //                                   schema: {
            //                                       type: "input",
            //                                       element: {
            //                                           label: "Aggregates",
            //                                           element_type: "input",
            //                                           type: "text",
            //                                           placeholder: "Enter aggregates"
            //                                       }
            //                                   }

            //                               },
            //                               {
            //                                   label: "Retention",
            //                                   name: "retention",
            //                                   element_type: "input",
            //                                   type: "text",
            //                                   placeholder: "Enter retention"
            //                               },
            //                           ]
            //                       }
            //                   }

            //               ]
            //           },

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
                // _.forEach(this.model,function(value,key) {
                //     }.bind(this));
                this.schema = this.makeSchema(null,this.model);
            },
            makeSchema(key,value) {

                if (typeof value == "object" && !Array.isArray(value)) {
                    let obj = {
                        type: "Object",
                        name: key,
                        elements: []
                    }
                    _.forEach(value,function(value,key) {
                        let result = this.makeSchema(key,value);
                        obj.elements.push(result);
                    }.bind(this));
                    return obj;

                } else if (typeof value == "string") {
                    let element =  {
                                  label: key,
                                  name: key,
                                  element_type: "input",
                                  type: "text",
                                  placeholder: ("Enter " + key)
                              };
                    return element;
                } else if (typeof value == "number") {
                    let element =  {
                                  label: key,
                                  name: key,
                                  element_type: "input",
                                  type: "number",
                                  placeholder: ("Enter " + key)
                              };
                    return element;
                } else if (typeof value == "boolean") {
                    let element =  {
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
                    let result = this.makeSchema(null,value[0]);
                    if (typeof value[0] == "object") {
                        console.log(value[0]);

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
                    _.forEach(pepper.properties, function(value, key) {
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
                        _.forEach(pepper.items.properties, function(value, key) {
                            let result = self.makeModel(key, value);
                            obj[key] = result[0];
                        });


                        return [{
                                [salt]: [obj]
                            }
                        ];
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
            }
        },
        computed: {},
        watch: {
            showModal: function(val) {
                if (val) {
                    this.transfromToModel();
                    this.transformToSchema();
                    // console.log(this.model);
                    $(this.$refs.postModal).modal("show");
                } else {
                    $(this.$refs.postModal).modal("hide");
                }
            }
        }
    };
</script>
