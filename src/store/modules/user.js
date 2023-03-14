import { login, getUserData } from "@/api/user";
import { cloneObj } from "@/utils/basic";

export default {
  namespaced: true,
  actions: {
    login: async ({ commit }, params) => {
      let response = await login(params);
      if (response) {
        localStorage.setItem("LoginUser", JSON.stringify(response));
        commit("SET_USER", response);
      }
      return !!response;
    },
    logout: ({ commit }) => {
      localStorage.setItem("AdminToken", "");
      commit("SET_USER", {});
    },
    renovate_user: async ({ commit }) => {
      let loginUser = JSON.parse(localStorage.getItem("LoginUser"));
      let userData = await getUserData(loginUser.id);
      if (!!userData) commit("SET_USER", userData);
    },
  },
  mutations: {
    SET_USER: (state, userData) => {
      state.loginUser = userData;
    },
    SET_EDIT_USER: (state, userData) => {
      state.editUser = cloneObj(userData);
    },
  },
  state: {
    loginUser: {},
    editUser: null,
  },
};
