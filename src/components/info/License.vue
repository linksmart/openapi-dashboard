<template >
    <div>
        <small class="form-text text-primary">
            <div v-if='license.url'>
                <a :href='license.url'>{{license.name}}</a>
            </div>
            <div v-else>
                {{license.name}}
            </div>
        </small>
    </div>
</template>


<script>

export default {
    props: ['license'],
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
