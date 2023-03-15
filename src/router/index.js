import { createRouter, createWebHashHistory } from "vue-router";

const userRoute = {
  name: "user",
  path: "user",
  component: () => import("@/layouts/BasicLayout"),
  meta: {
    icon: "User",
    title: "用户管理",
  },
  children: [
    {
      name: "userList",
      path: "list",
      component: () => import("@/views/UserList"),
      meta: {
        icon: "List",
        title: "用户管理",
      },
    },
  ],
};

const activityRoute = {
  name: "activity",
  path: "activity",
  component: () => import("@/layouts/BasicLayout"),
  meta: {
    icon: "Menu",
    title: "活动管理",
  },
  children: [
    {
      name: "activityList",
      path: "list",
      component: () => import("@/views/ActivityList"),
      meta: {
        icon: "List",
        title: "活动管理",
      },
    },
  ],
};

const activityItemRoute = {
  name: "activityItem",
  path: "activity-item",
  component: () => import("@/layouts/BasicLayout"),
  meta: {
    icon: "List",
    title: "项目管理",
  },
  children: [
    {
      name: "activityItemList",
      path: "list",
      component: () => import("@/views/ActivityItemList"),
      meta: {
        icon: "List",
        title: "项目管理",
      },
    },
  ],
};


export default createRouter({
  history: createWebHashHistory(),
  routes: [
    // 登录
    {
      name: "login",
      path: "/login",
      component: () => import("@/views/Login"),
      meta: {
        title: "登录",
      },
    },
    // 根菜单
    {
      name: "root",
      path: "/",
      redirect: "/user/list",
      children: [
        userRoute, 
        activityRoute,
        activityItemRoute,
      ],
    },
  ],
});
