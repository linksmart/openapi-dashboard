import Vue from 'vue';
import Vuex from 'vuex';
// var _ = require('lodash');
var _ = {
  isEmpty: require('lodash/isEmpty'),
  map: require('lodash/map'),
  find: require('lodash/find'),
  findIndex: require('lodash/findIndex'),
  has: require('lodash/has'),
  forEach: require('lodash/forEach'),
};
import createPersistedState from 'vuex-persistedstate';


Vue.use(Vuex);


export default new Vuex.Store({
  state: {
      original_config : {},
      config : {},
      serverUrl: "",
      swaggerConfigUrl: "",
      crudTableViewStates: []
  },
  plugins: [createPersistedState()],
  mutations: {
      setConfig: (state,config) => {
        Vue.set(state,'config',config)
    },
      setOriginalConfig: (state,config) => {
        Vue.set(state,'original_config',config)
    },
      setServerUrl: (state,url) => {
        Vue.set(state,'serverUrl',url)
    },
      setSwaggerConfigUrl: (state,url) => {
        Vue.set(state,'swaggerConfigUrl',url)
    },
    addCrudTableViewState: (state,crudTableViewState) => {
        state.crudTableViewStates.push(crudTableViewState);
    },
    updateCrudTableViewState: (state,payload) => {
        Vue.set(state.crudTableViewStates[payload.index],'payload',payload.payload)
    },
    updateCrudTableViewStateSelectedAttributes: (state,payload) => {
        Vue.set(state.crudTableViewStates[payload.index].payload,'selected_attributes',payload.selectedAttributes)
    },
    removeCrudTableViewState: (state,index) => {
        state.crudTableViewStates.splice(index,1);
    },
  },
  actions: {

  },
  getters: {
    IS_CONFIG_EMPTY: state => {
      return _.isEmpty(state.config);
    },

    crudStateIndex: state => (path,method) => {
      return _.findIndex(state.crudTableViewStates, {"path":path,"method":method});
    },

    getCrudTableViewStates: state => {
        return state.crudTableViewStates;
    },
    getCrudTableViewStatesCount: state => {
        return state.crudTableViewStates.length;
    },
    getCrudTableViewState: (state) => (index) => {
        return state.crudTableViewStates[index];
    },

    INFO: state => {
      return state.config.info;
    },

    VERSION: state => {
      return state.config.openapi;
    },

    PATHS: state => {
        return state.config.paths;
    },

    TAGS: state => {
        return state.config.tags;
    },

    SERVER_URL: state => {
        return state.serverUrl;
    },

    SWAGGER_CONFIG_URL: state => {
        return state.swaggerConfigUrl;
    },

    IS_TAGS_EMPTY: state => {
        return _.isEmpty(state.config.tags);
    },

    TAGS_NAMES: state => {
        return _.map(state.config.tags,"name");
    },

    getTagByName: (state) => (name) => {
        return _.find(state.config.tags, { 'name': name });
    },

    getResponseByPathAndMethod: (state) => (path,method) => {
        if (_.has(state.config.paths,`${path}.${method}.responses.200`)) {
            return state.config.paths[path][method].responses['200'];
        } else {
            return;
        }
    },
    getRequestByPathAndMethod: (state) => (path,method) => {
        if (_.has(state.config.paths,`${path}.${method}.requestBody`)) {
            return state.config.paths[path][method].requestBody;
        } else {
            return;
        }
    },

    getParametersByPathAndMethod: (state) => (path,method) => {
        // return global parameters if it is provided for a single path
        if (_.has(state.config.paths,`${path}.parameters`)) {
            return state.config.paths[path][method].parameters;
        }

        if (_.has(state.config.paths,`${path}.${method}.parameters`)) {
            return state.config.paths[path][method].parameters;
        } else {
            return;
        }
    },

    IS_CRUDABLE: (state) => (path,method) => {
        let newPath = state.config.paths[path];
        if (!newPath) {
            return false;
        }

        let newMethod = newPath[method];
        if (!newMethod) {
            return false;
        }
        if (_.has(newMethod, 'responses.200.content')) {
            let content = newMethod.responses['200'].content;
            _.forEach(content, function(value,key) {
                if (_.has(value,'schema.type')) {
                    return
                }
            });

            // content = content[Object.keys(content)[0]];
            // console.log();
        } else {
            return false;
        }
        return true;
    },

    // getMeterReadingsCount: (state) => (index) => {
    //   return state.site_bookings[index].meter_readings.length;
    // },

  }
});
