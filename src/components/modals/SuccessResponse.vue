<template>
    <div class="modal fade" ref="successResponseModal" tabindex="-1" role="dialog" aria-labelledby="Success response" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Success Response <span class="badge badge-success">{{status}}</span></h5>
                <button type="button" class="close" aria-label="Close" @click="$emit('closeModal')">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="headers">
                    <h6>
                        Response headers
                    </h6>
                    <span v-if="!isHeaderEmpty">
                        {{response.headers}}
                    </span>
                    <span v-else>
                        -
                    </span>
                </div>
                <hr>
                <div class="data">
                    <h6>
                        Response data
                    </h6>
                    <span v-if="!isDataEmpty">
                        {{response.data}}
                    </span>
                    <span v-else>
                        -
                    </span>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="$emit('closeModal')">Close</button>
            </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "SuccessResponse",
    props: {
        response: {
            type: Array | Object | String,
            required:true
        },
        showModal: {
            type: Boolean,
            default: false,
            required:true
        }
    },
    data() {
        return {

        }
    },
    mounted() {
        $(this.$refs.successResponseModal).on('hidden.bs.modal',  (e) => {
            this.$emit('closeModal');
        });
    },
    watch: {
        showModal: function (val) {
            if (val) {
                $(this.$refs.successResponseModal).modal('show');
            } else {
                $(this.$refs.successResponseModal).modal('hide');
            }
        },
    },
    computed: {
        isDataEmpty() {
            return _.isEmpty(this.response.data)
        },
        isHeaderEmpty() {
            return _.isEmpty(this.response.headers)
        },
        status() {
            return _.has(this.response,'status') ? this.response.status : "-";
        }
    }

}
</script>
