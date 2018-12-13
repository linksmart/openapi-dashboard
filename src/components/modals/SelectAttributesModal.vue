<template >
    <div>
        <div class="modal fade" ref='selectAttributeModal' tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" >
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Select attributes to show in the table</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="$emit('closeModal')">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <SelectAttributes :selected-attributes='selected_attributes' :entry-data-properties='entry_data_properties' @addAttribute="addAttribute(...arguments)" @removeAttribute="removeAttribute(...arguments)" @setRootId="setRootId(...arguments)"/>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="$emit('closeModal')">Close</button>
                        <button type="button" class="btn btn-primary" @click="updateAttributes">Update attributes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import SelectAttributes from '../SelectAttributes.vue';

var _ = {
    isEmpty: require('lodash/isEmpty'),
    find: require('lodash/find'),
    has: require('lodash/has'),
    forEach: require('lodash/forEach'),
    findIndex: require('lodash/findIndex'),
    isObject: require('lodash/isObject'),
    includes: require('lodash/includes'),
    cloneDeep: require('lodash/cloneDeep'),
};
export default {
    props: ['showModal','entryDataProperties','selectedAttributes'],
    data: function () {
        return {
            response_content: {},
            entry_data: {},
            entry_data_properties : _.cloneDeep(this.entryDataProperties),
            selected_attributes : _.cloneDeep(this.selectedAttributes),
        }
    },
    mounted(){
        $(this.$refs.selectAttributeModal).on('hidden.bs.modal', function (e) {
            this.$emit('closeModal');
        }.bind(this));
    },
    components: {
        SelectAttributes
    },
    methods: {
        setRootId(selected_attribute) {
            let self = this;
            _.forEach(this.selected_attributes,function(value,key) {
                if (value.config_path !== selected_attribute.config_path) {
                    self.selected_attributes[key].isRoot = false;
                }
            });
        },
        resetData() {
            this.entry_path = '';
            this.entry_data = {};
            this.response_content = {};
            this.selected_attributes = [];
        },
        removeAttribute(config_path){
            let index = _.findIndex(this.selected_attributes, { 'config_path': config_path});
            if (index > -1) {
                this.selected_attributes.splice(index,1);
            } else {
                this.showError('Attribute not found')
            }
        },
        addAttribute(name,config_path,data_path,type){
            this.selected_attributes.push({
                name: name,
                config_path: config_path,
                data_path: data_path,
                type: type,
                isRoot: false
            });
            this.showSuccess('"'+ name + '" attribute added successfully');
        },
        updateAttributes() {
            this.$emit('updateAttributes',this.selected_attributes);
            this.$emit('closeModal');
        }
    },
    computed: {

    },
    watch: {
        showModal: function (val) {
            if (val) {
                $(this.$refs.selectAttributeModal).modal('show');
            } else {
                $(this.$refs.selectAttributeModal).modal('hide');
            }
        },

    }
}

</script>
