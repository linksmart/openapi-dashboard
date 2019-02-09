<template>
    <div class="modal fade" ref="failureResponseModal" tabindex="-1" role="dialog" aria-labelledby="Failure response" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Failure Response <span class="badge badge-danger">{{status}}</span></h5>
                <button type="button" class="close" aria-label="Close" @click="$emit('closeModal')">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div v-if="hasFailureMessage" class="failure-message">
                    <h6>
                        Failure message
                    </h6>
                    <span class="text-danger">
                        {{this.failureMessage}}
                    </span>
                </div>
                <hr>
                <div class="headers">
                    <h6>
                        Response headers
                    </h6>
                    <pre v-if="!isHeaderEmpty">{{response.headers}}</pre>
                    <pre v-else>-</pre>
                </div>
                <hr>
                <div class="data">
                    <h6>
                        Response data
                    </h6>
                    <pre v-if="!isDataEmpty">{{response.data}}</pre>
                    <pre v-else>-</pre>
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
        $(this.$refs.failureResponseModal).on('hidden.bs.modal',  (e) => {
            this.$emit('closeModal');
        });
    },
    watch: {
        showModal: function (val) {
            if (val) {
                $(this.$refs.failureResponseModal).modal('show');
            } else {
                $(this.$refs.failureResponseModal).modal('hide');
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
        failureMessage() {
            let message = "";

            if (this.isDataEmpty) {
                return message;
            }

            if (this.response.data.message) {
                return this.response.data.message;
            }

            if (this.response.data.msg) {
                return this.response.data.msg;
            }

            return message;
        },
        hasFailureMessage() {
            return this.failureMessage != "";
        },
        status() {
            return _.has(this.response,'status') ? this.response.status : "-";
        }
    }

}
</script>
