import { request } from "@/utils/request";

const userApi = {
  login: "/api/user/login",
  find: "/api/user/find",
  findCount: "/api/user/find-count",
  userData: "/api/user/get",
  userDataByEmail: "/api/user/getByEmail",
  create: "/api/user/create",
  update: "/api/user/update",
};

export function login(params) {
  return request({
    method: "post",
    url: userApi.login,
    data: params,
  });
}

export function getUsers(params) {
  return request({
    url: userApi.find,
    params,
  });
}

export function getUsersCount(params) {
  return request({
    url: userApi.findCount,
    params,
  });
}

export function getUserData(id = 0) {
  return request({
    url: userApi.userData,
    params: {
      id,
    },
  });
}

export function getUserDataByEmail(email) {
  return request({
    url: userApi.userDataByEmail,
    params: {
      email,
    },
  });
}

export function createUser(data) {
  return request({
    method: "post",
    url: userApi.create,
    data,
  });
}

export function updateUser(data) {
  return request({
    method: "post",
    url: userApi.update,
    data,
  });
}
