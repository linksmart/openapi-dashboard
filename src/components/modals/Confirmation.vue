<template>
    <div class="modal fade" ref="Confirmation" tabindex="-1" role="dialog" aria-labelledby="Confirmation" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header" v-if="title != ''">
                    {{title}}
                </div>
                <div class="modal-body">
                    {{msg}}
                </div>
                <div class="modal-footer">
                    <button v-if="showOk" type="button" class="btn btn-primary btn-sm btn-cons pull-left inline" data-dismiss="modal" @click="handleOk">Ok</button>
                    <button v-if="showCancel" type="button" class="btn btn-secondary btn-sm btn-cons no-margin pull-left inline" data-dismiss="modal" @click="handleCancel">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { EventBus } from '../../event-bus.js';

export default {
    name: "Confirmation",
    data() {
        return {
            visible : false,
            msg : "",
            title : "",
            confirmable : false,
            callback: "",
            callbackData: null,
            showOk: true,
            showCancel: true
        }
    },
    mounted() {
        EventBus.$on('confirmation', (payload) => {
            this.visible = true;
            this.msg = (payload.msg) ? payload.msg : "";
            this.title = (payload.title) ? payload.title : "";
            this.confirmable = (payload.confirmable) ? payload.confirmable : false;
            this.callback = (payload.callback) ? payload.callback : "";
            this.callbackData = (typeof payload.callbackData != "undefined") ? payload.callbackData : null;
            this.showOk = (typeof payload.showOk != "undefined") ? payload.showOk : true;
            this.showCancel = (typeof payload.showCancel != "undefined") ? payload.showCancel : true;
        });

        $(this.$refs.Confirmation).on('hidden.bs.modal', function (e) {
            this.handleCancel();
        }.bind(this));

    },
    methods: {
        reset() {
            this.msg = "";
            this.confirmable = false;
            this.callback = "";
            this.callbackData = null;
            this.showOk = true;
            this.showCancel = true;
        },
        handleOk() {
            if (this.confirmable) {
                EventBus.$emit(this.callback,{
                    success:true,
                    callbackData : this.callbackData
                })
            }
            this.visible = false;
        },
        handleCancel() {
            if (this.confirmable) {
                EventBus.$emit(this.callback,{
                    success : false,
                    callbackData : this.callbackData
                })
            }
            this.visible = false;
        }

    },
    watch: {
        visible(newVal,oldVal){
            if (newVal) {
                 $(this.$refs.Confirmation).modal('show');
            } else {
                this.reset();
                 $(this.$refs.Confirmation).modal('hide');
            }
        }
    }
}
</script>
