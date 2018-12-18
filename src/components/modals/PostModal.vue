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
                        <vue-form-generator :schema="schema" :model="model" :options="formOptions" @validated="onValidated"></vue-form-generator>
                        <!-- <field-object :model="testmodel" :schema="testschema" :formOptions="formOptions" @validated="onValidated"></field-object> -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="$emit('closeModal')">Close</button>
                        <button type="button" class="btn btn-primary" @click="post">Post</button>
                        <!-- <button type="button" class="btn btn-primary" @click="updateAttributes">Update attributes</button> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {
        mapMutations,
        mapGetters
    } from 'vuex';


    export default {
        props: ["tableIndex", "requestBody", "showModal", "path", "method"],
        data: function() {
            return {
                schema: {
                    fields: []
                },
                formOptions: {
                    validateAfterLoad: true,
                    validateAfterChanged: true,
                    fieldIdPrefix: "table_" + this.tableIndex + "_"
                },
                model: {}
            };
        },
        mounted() {
            $(this.$refs.postModal).on(
                "hidden.bs.modal",
                function(e) {
                    this.$emit("closeModal");
                    this.model = {};
                    this.schema.fields = [];
                }.bind(this)
            );
        },
        components: {},
        methods: {
            onValidated(isValid, errors) {
                console.log(isValid);
            },

            post() {
                console.log(Array.isArray(this.model.pepper));

                if (Array.isArray(this.model.pepper)) {
                    let test = _.map(this.model.pepper, function(item) {
                        return _.pickBy(item, function(val) {
                            return (val !== "");
                        });
                    });
                    console.log(test);
                }


                axios.post(this.ROOT_URL + this.path, [{
                        "n": "testddresource",
                        "u": "V",
                        "vs": "sdf"
                    }])
                    .then(function(response) {
                        console.log(response);

                    })
                    .catch(function(error) {
                        console.log(error);

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
                        self.model = _.cloneDeep(result[0]);
                        self.schema.fields.push(_.cloneDeep(result[1]));
                    } else if (
                        this.requestBody.content["application/json"].schema.type == "array"
                    ) {
                        let result = self.makeModel(
                            "pepper",
                            this.requestBody.content["application/json"].schema
                        );
                        self.model = _.cloneDeep(result[0]);
                        self.schema.fields.push(_.cloneDeep(result[1]));
                    }
                } else {
                    console.log("json schema not found");
                }
            },
            makeModel(salt, pepper) {

                let self = this;
                if (pepper.type == "object") {
                    let obj = {};
                    obj[salt] = {};
                    let objfield = {
                        type: "object",
                        label: salt,
                        model: salt,
                        schema: {
                            fields: []
                        }
                    };
                    _.forEach(pepper.properties, function(value, key) {
                        if (value.type == "object" || value.type == "array") {
                            let result = self.makeModel(key, value);
                            obj[salt][key] = result[0][key];
                            objfield.schema.fields.push(result[1]);
                        } else {
                            let result = self.makeModel(key, value);
                            obj[salt][key] = result[0];
                            objfield.schema.fields.push(result[1]);
                        }
                    });

                    objfield.default = _.cloneDeep(obj);
                    return [obj, objfield];
                }

                if (pepper.type == "string") {
                    let field = {
                        type: "input",
                        inputType: "text",
                        label: salt,
                        model: salt
                    };
                    return [null, field];
                }

                if (pepper.type == "integer" || pepper.type == "number") {
                    let field = {
                        type: "input",
                        inputType: "number",
                        label: salt,
                        model: salt
                    };
                    return [null, field];
                }

                if (pepper.type == "boolean") {
                    let field = {
                        type: "checkbox",
                        label: salt,
                        model: salt
                    };
                    return [null, field];
                }

                if (pepper.type == "array") {
                    if (pepper.items.type == "object") {
                        let obj = {};
                        let arrfield = {
                            type: "array",
                            label: salt,
                            model: salt,
                            showRemoveButton: true,
                            items: {
                                type: "object",
                                default: {},
                                schema: {
                                    fields: []
                                }
                            }
                        };
                        _.forEach(pepper.items.properties, function(value, key) {
                            let result = self.makeModel(key, value);
                            obj[key] = result[0];
                            arrfield.items.schema.fields.push(result[1]);
                        });

                        arrfield.items.default = _.cloneDeep(obj);

                        return [{
                                [salt]: [obj]
                            },
                            arrfield
                        ];
                    } else if (pepper.items.type == "string") {
                        let field = {
                            type: "array",
                            label: salt,
                            model: salt,
                            showRemoveButton: true
                        };
                        return [
                            [""], field
                        ];
                    } else if (pepper.items.type == "integer" || pepper.type == "number") {
                        let field = {
                            type: "array",
                            label: salt,
                            model: salt,
                            showRemoveButton: true
                        };
                        return [
                            [0], field
                        ];
                    } else if (pepper.type == "boolean") {
                        let field = {
                            type: "array",
                            label: salt,
                            model: salt,
                            showRemoveButton: true
                        };
                        return [
                            [false], field
                        ];
                    }
                }
            }
        },
        computed: {
            ...mapGetters([
                'ROOT_URL',
            ]),
        },
        watch: {
            showModal: function(val) {
                if (val) {
                    this.transfromToModel();
                    // console.log(this.model);
                    $(this.$refs.postModal).modal("show");
                } else {
                    $(this.$refs.postModal).modal("hide");
                }
            },
            model: {
                handler: function(newValue) {
                    // this.
                },
                deep: true
            },
        }
    };
</script>
