import Vue from 'vue'
import Vuex from 'vuex'
import { deepCopy } from 'libs'
import * as types from './types'
Vue.use(Vuex)

const state = {
	headerHeight: 0
};

const getters = {
	headerHeight: state => state.headerHeight
};

const mutations = {
	[types.CHANGE_TO_WIN] (state) {
		state.headerHeight = 1;
	},
	[types.SAVE_PERMS] (state, obj) {
		state.headerHeight = deepCopy(obj.headerHeight);
	}
};

const actions = {
	changeToWin: ({ commit }) => {
		commit(types.CHANGE_TO_WIN);
	},
	savePerms: ({ commit }, obj) => {
		commit(types.SAVE_PERMS, obj);
	}
};

export default new Vuex.Store({
	state,
	getters,
	mutations,
	actions
})