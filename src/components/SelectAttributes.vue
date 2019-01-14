<template >
    <div>
        <div class="row">
            <div class="col-md-6">
                <vue-json-pretty
                path=''
                :data="entryDataProperties"
                selectableType='tree'
                :deep=1
                :showLength=true
                @click="attributeSelector">
            </vue-json-pretty>
        </div>
        <div class="col-md-6">
            <ul class="list-group">
                <li v-for="(selected_attribute,key,index) in selectedAttributes" :key='index' class="list-group-item">
                    <div class="row">
                        <div class="col-md-1">
                            <div v-if='showCheckBox(selected_attribute)' class="Checkbox">
                                <input type="checkbox" @change="$emit('setRootId',selected_attribute)" v-model='selected_attribute.isRoot'/>
                                <div class="Checkbox-visible"></div>
                            </div>
                        </div>
                        <div class="col-md-10">
                            <div class="row">
                                <div class="col-md-12">
                                    <button type="button" class="close pull-right" aria-label="Close" @click="$emit('removeAttribute',selected_attribute.config_path)">
                                        <span aria-hidden="true">&nbsp;&times;</span>
                                    </button>
                                    Name : {{selected_attribute.name}} <span class="badge badge-secondary">{{selected_attribute.type}}</span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12">
                                    Path : {{selected_attribute.data_path}}
                                </div>
                            </div>
                        </div>

                    </div>
                </li>
            </ul>
        </div>
    </div>
    <br>

</div>
</template>


<script>
    import VueJsonPretty from 'vue-json-pretty';

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
        props: ['selectedAttributes','entryDataProperties'],
        data: function () {
            return {

            }
        },
        components: {
            VueJsonPretty
        },
        mounted(){

        },
        methods: {
            attributeSelector(path,data) {
                let cleanedPath = this.removeFirstDot(path);
                if (_.isEmpty(cleanedPath)) {
                    this.showError('Path is empty');
                    return;
                }
                if (_.find(this.selectedAttributes, { 'config_path': cleanedPath})) {
                    this.showError('Duplicate selection');
                    return;
                }

                let result = cleanedPath.split('.');
                let resultLength = result.length;

                if (_.isObject(data) && _.has(data,'type') && result[resultLength-1] !== 'properties' && result[resultLength-1] !== 'items') {
                    if (data.type === 'array' && _.includes(path, 'items.properties')) {
                        this.showError('Invalid attribute selection');
                    } else {
                        let type = '';
                        if (_.includes(path, 'items.properties')) {
                            type = 'array of ' + data.type;
                        } else if (data.path === 'object') {
                            type = 'object';
                        } else if (data.type === 'array') {
                            type = 'array of ' + data.items.type;
                        } else {
                            type = data.type;
                        }
                        this.$emit('addAttribute',result[resultLength-1],cleanedPath,this.getDataPath(cleanedPath),type);
                    }
                } else {
                    this.showError('Invalid attribute selection');
                }
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
            getDataPath(config_path){

                if (_.includes(config_path,'.items.properties.')) {
                    return config_path.replace(/.items.properties./gi,'.');
                }

                if (_.includes(config_path,'.properties.')) {
                    return config_path.replace(/.properties./gi,'.');
                }

                return config_path;

            },
            showCheckBox(selected_attribute) {
                return !(_.includes(selected_attribute.type,'array') || _.includes(selected_attribute.type,'object'))
            },
        },
        computed: {

        }
    }
</script>
