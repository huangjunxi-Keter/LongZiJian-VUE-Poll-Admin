import { createStore } from "vuex";

import user from "./modules/user";
import system from "./modules/system";
import news from "./modules/news";

export default createStore({
  state: {},
  actions: {},
  mutations: {},
  modules: { user, system, news },
});
