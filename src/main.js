// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

window.$ = window.jQuery = require('jquery');
import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import 'bootstrap';

window.axios = require('axios');
window._ = require('lodash');

import VueGoodTablePlugin from 'vue-good-table';

import store from './swaggerstore';
import Dashboard from "./components/Dashboard.vue";
import Explorer from "./components/Explorer.vue";
import Confirmation from "./components/modals/Confirmation.vue";
import Crud from "./components/Crud.vue";
import Post from "./components/Post.vue";
import FormView from "./components/FormView.vue";
import Put from "./components/Put.vue";
import NavBar from "./components/NavBar.vue";
import Info from './components/info/Info.vue';
import { mapMutations,mapGetters } from 'vuex'
import 'vue-good-table/dist/vue-good-table.css'
import Noty from 'noty';
import VueFormGenerator from "vue-form-generator";
import ModuleLibrary from 'vfg-field-array';
import ModuleLibraryObject from 'vfg-field-object';
import './assets/scss/index.scss';

Vue.use(VueRouter);
Vue.use(VueGoodTablePlugin);
Vue.use(VueFormGenerator);
Vue.use(ModuleLibrary);
Vue.use(ModuleLibraryObject);

const routes = [
    {
        name: 'root',
        path: '/',
        redirect: {
            name : 'dashboard'
        },
    },
    {
        name: 'dashboard',
        path: '/dashboard',
        component: Dashboard,
    },
    {
        name: 'explorer',
        path: '/explorer',
        component: Explorer,
    },
    {
        name: 'crud',
        path: '/crud/',
        component: Crud,
    },
    {
        name: 'post',
        path: '/post',
        component: Post,
    },
    {
        name: 'formView',
        path: '/form-view',
        component: FormView,
    },
    {
        name: 'put',
        path: '/put',
        component: Put,
    }
];

// define a mixin object
var myMixin = {
    methods: {
        showError(msg, timeout = 2500) {
            new Noty({
                type: 'error',
                text: msg,
                timeout: timeout
            }).show();
        },
        showSuccess(msg, timeout = 2500) {
            new Noty({
                type: 'success',
                text: msg,
                timeout: timeout
            }).show();
        },
    }
}

Vue.mixin(myMixin);

const router = new VueRouter({
    routes,
    mode: 'history',
    linkActiveClass: "active"
});


router.beforeEach((to, from, next) => {
    let restrictReloadRouteNames = ["put","post"];

    if (restrictReloadRouteNames.find(routeName => routeName === to.name)) {
        $(window).on("beforeunload", function(e) {
            return false;
        });
    } else {
        $(window).off("beforeunload");
    }

    next();
});

new Vue({
    el: '#app',
    router,
    store,
    data: {
        test: 'ddd'
    },
    mounted() {},
    computed: {
        ...mapGetters([
            'IS_CONFIG_EMPTY',
            'INFO',
        ]),
    },
    components: {
        Info,
        NavBar,
        Confirmation
    }
})
