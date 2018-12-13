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
var _ = {
  isEmpty: require('lodash/isEmpty'),
  map: require('lodash/map'),
  find: require('lodash/find'),
  has: require('lodash/has'),
  forEach: require('lodash/forEach'),
  includes: require('lodash/includes'),
};

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
        if (this.IS_CONFIG_EMPTY) {
            this.$router.push({'name':'dashboard'})
        }
        this.groupPathByTags();
    },
    methods: {
        ...mapMutations( [
        'setConfig',
        ]),
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
        ]),
    }
}
</script>
