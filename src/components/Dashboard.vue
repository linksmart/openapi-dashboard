<template >
    <div id="dashboard-container-fluid" class="container-fluid">
        <div id="dashboard-card" class="card">
            <div class="card-body">
                <div class="form-group">
                    <h5 class="card-title">Swagger json url</h5>
                    <input type="url" class="form-control" id="url" aria-describedby="url" placeholder="Swagger url" v-model='url'>
                    <!-- <small id="emailHelp" class="form-text text-primary">Enter the url to find the swagger config file</small> -->
                    <h5 class="card-title">Server root url</h5>
                    <input type="url" class="form-control" id="root-url" aria-describedby="root-url" placeholder="Server root url" v-model='rootUrl'>
                    <!-- <small id="emailHelp" class="form-text text-primary">Enter the url to find the swagger config file</small> -->
                </div>
                <a href="" class="btn btn-primary" @click.prevent='fetchSwaggerJson'>Let's Go!!!</a>
            </div>
        </div>
        <!-- <a href="" class="btn btn-primary" @click.prevent='validateFormat'>Validate</a> -->
    </div>
</template>


<script>
import axios from 'axios';
var SwaggerParser = require('swagger-parser');
import { mapMutations,mapGetters } from 'vuex'
var _ = {
  cloneDeep: require('lodash/cloneDeep'),
};

export default {
    data: function () {
        return {
            // url:'https://app.swaggerhub.com/apiproxy/schema/file/farshidtz8/deployment-tool/0.4.0/swagger.json',
            url:'http://localhost:8081/static/json/openapi.json',
            rootUrl:'http://localhost:8085',
            // rootUrl:'http://linksmart-dev.fit.fraunhofer.de/hds',
            config:{}
        }
    },
    mounted(){

    },
    methods: {
        ...mapMutations( [
            'setConfig',
            'setOriginalConfig',
            'setRootUrl',
        ]),

        fetchSwaggerJson() {
            //
            // SwaggerParser.validate(this.url, function(err, api) {
            //     if (err) {
            //         console.error(err);
            //     }
            //     else {
            //         console.log(api);
            //         // console.log("API name: %s, Version: %s", api.info.title, api.info.version);
            //     }
            // });

            // return;

            if (this.url === '') {
                alert('url is empty')
                return;
            }

            let self = this;

            axios.get(this.url)
            .then(function (response) {
                // storing origial congif before dereferencing
                let swaggerConfig = response.data;
                self.setOriginalConfig(swaggerConfig);

                // deferencing swagger config to resolve references
                SwaggerParser.dereference(_.cloneDeep(swaggerConfig))
                .then(function(api) {
                    self.config = api;
                    self.setConfig(api);
                    self.setRootUrl(self.rootUrl);
                    self.$router.push({ name: 'explorer'});
                }).catch(function (error) {
                    // handle error
                    console.log(error);
                });

            });
        },
        validateFormat() {
            SwaggerParser.parse(this.url)
            .then(function(api) {
                console.log(api);
                // console.log("API name: %s, Version: %s", api.info.title, api.info.version);
            });
            // SwaggerParser.validate(this.url);
        }
    }
}
</script>
