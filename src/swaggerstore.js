import Vue from 'vue';
import Vuex from 'vuex';
// var _ = require('lodash');
var _ = {
  isEmpty: require('lodash/isEmpty'),
  map: require('lodash/map'),
  find: require('lodash/find'),
  has: require('lodash/has'),
  forEach: require('lodash/forEach'),
};

Vue.use(Vuex);


export default new Vuex.Store({
  state: {
      original_config : {},
      config : {},
      serverUrl: "",
      swaggerConfigUrl: "",

  },
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
  },
  actions: {

  },
  getters: {

    IS_CONFIG_EMPTY: state => {
      return _.isEmpty(state.config);
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
