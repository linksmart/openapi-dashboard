<template >
    <div>
        <div class="form-group">
            <h5 class="card-title">
                {{info.title}} <span class="badge badge-info">(version {{info.version}})</span> <span v-if='info.termsOfService' class="badge badge-default"><a :href="info.termsOfService">Terms and conditions</a></span>
             </h5>
             <p>{{info.description}}</p>
             <Contact v-if='info.contact' :contact="info.contact"/>
             <License v-if='info.license' :license="info.license"/>
        </div>
    </div>
</template>


<script>
import Contact from './Contact.vue'
import License from './License.vue'

export default {
    props: ['info'],
    data: function () {
        return {
        }
    },
    mounted(){

    },
    components: {
        License,
        Contact
    },
    methods: {

    },
    computed: {

    }
}

</script>
