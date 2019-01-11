<template >
    <div v-if='!IS_CONFIG_EMPTY' class="container-fluid">
        <div class="card">
            <div class="card-body">
                <Info :info='INFO'/>
            </div>
        </div>
        <br>
        <TagTable v-for="(group, index) in groups" v-bind:key="index" v-bind:group="group" :prop-index='index'> </TagTable>
    </div>
</template>


<script>
import axios from 'axios';
var SwaggerParser = require('swagger-parser');
import { mapMutations,mapGetters } from 'vuex'
import Info from './info/Info.vue';
import TagTable from './TagTable.vue';

export default {
    data: function () {
        return {
            groups: []
        }
    },
    components: {
        Info,
        TagTable
    },
    mounted(){

        if (this.SERVER_URL === "" && localStorage.serverUrl && localStorage.serverUrl != "") {
            this.setServerUrl(localStorage.serverUrl);
        }

        if (this.SWAGGER_CONFIG_URL === "" &&  localStorage.swaggerConfigUrl && localStorage.swaggerConfigUrl != "") {
            this.setSwaggerConfigUrl(localStorage.swaggerConfigUrl);
        }

        if (this.IS_CONFIG_EMPTY) {
            if (this.SWAGGER_CONFIG_URL != "") {
                this.fetchSwaggerJson(this.SWAGGER_CONFIG_URL);
            } else {
                this.$router.push({'name':'dashboard'})
            }
        } else {
            this.groupPathByTags();
        }
    },
    methods: {
        ...mapMutations( [
        'setConfig',
        'setOriginalConfig',
        'setServerUrl',
        'setSwaggerConfigUrl',
        ]),
        fetchSwaggerJson(swaggerConfigUrl) {

            let self = this;

            axios.get(swaggerConfigUrl)
                .then(function (response) {
                    // storing origial congif before dereferencing
                    let swaggerConfig = response.data;
                    self.setOriginalConfig(swaggerConfig);

                    // deferencing swagger config to resolve references
                    SwaggerParser.dereference(_.cloneDeep(swaggerConfig))
                        .then(function (api) {
                            self.config = api;
                            self.setConfig(api);
                            self.groupPathByTags();
                        }).catch(function (error) {
                            // handle error
                            console.log('unable to fetch swagger config error go');
                            // self.$router.push({'name':'dashboard'})
                        });

                }).catch((error) => {
                    // self.$router.push({'name':'dashboard'})
                    console.log('unable to fetch swagger config error');
                });
        },
        updateRows() {
            // _.forEach(this.PATHS, function(value) {
            //     this.finds.push({ value: 'def' })
            // });
        },
        groupPathByTags() {
            // let groups = [];
            let self = this;
            let emptyTags = [];
            let misc = [];
            let allowed_methods = ["get","put","post","delete","patch"];
            _.forEach(this.TAGS_NAMES, function(tag_name) {
                let group = [];
                _.forEach(self.PATHS,function(methods,path) {
                    _.forEach(methods,function(value,key) {
                        if (!_.includes(allowed_methods,key)) {
                            return;
                        }
                        if (_.isEmpty(value.tags)) {
                            emptyTags.push(key);
                            return;
                        }
                        if (_.includes(value.tags,tag_name)) {
                            group.push({"path":path,"method":key});
                        }
                    });
                });
                self.groups.push({"tag_name":tag_name,"paths":group});
            });
        },
    },
    computed: {
        ...mapGetters([
        'IS_CONFIG_EMPTY',
        'VERSION',
        'INFO',
        'PATHS',
        'IS_TAGS_EMPTY',
        'TAGS',
        'TAGS_NAMES',
        'SERVER_URL',
        'SWAGGER_CONFIG_URL',
        ]),
    }
}
</script>
