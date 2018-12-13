<template >
    <div>
        <span>{{contact.name}} <a v-if='contact.url' :href="contact.url"><i class="fas fa-globe"></i></a> <a v-if='contact.email' :href="'mailto:' + contact.email"><i class="far fa-envelope"></i></a></span>
    </div>
</template>


<script>

export default {
    props: ['contact'],
    data: function () {
        return {
        }
    },
    mounted(){

    },
    methods: {

    },
    computed: {

    }
}

</script>
