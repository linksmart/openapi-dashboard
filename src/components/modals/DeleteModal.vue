<template >
    <div>
        <div class="modal fade" ref='selectArrayModal' tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" >
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Request parameters for "{{path}}" ({{method}})</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="$emit('closeModal')">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <request-parameters-form :parameters="parameters"
                                                 :server-url="serverUrl"
                                                 :path="path"
                                                 :prefils="prefils"
                                                 @on-request-params-change="handleRequestParamsChange" />

                    </div>
                    <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click='$emit("trigger-delete",fullUrl)'>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>

    import RequestParametersForm from '../RequestParametersForm.vue';

    export default {
        name: "DeleteModal",
        props: ['showModal','serverUrl','path','method','tableIndex','parameters',"prefils"],
        data: function () {
            return {
                fullUrl: "",
            }
        },
        mounted(){
            $(this.$refs.selectArrayModal).on('hidden.bs.modal', function (e) {
                this.$emit('closeModal');
            }.bind(this));
        },
        components: {
            RequestParametersForm
        },
        methods: {
            handleRequestParamsChange(payload) {
                this.fullUrl = payload.fullUrl
            }
        },
        watch: {
            showModal: function (val) {
                if (val) {
                    $(this.$refs.selectArrayModal).modal('show');
                } else {
                    $(this.$refs.selectArrayModal).modal('hide');
                }
            }
        }
    }

</script>
