import { request } from "@/utils/request";

const pollActivityApi = {
  find: '/api/poll-activity/find',
  findCount: '/api/poll-activity/find-count',
  get: '/api/poll-activity/get',
  create: '/api/poll-activity/create',
  update: '/api/poll-activity/update',
}

export function findPollActivitys(params) {
  return request({
    url: pollActivityApi.find,
    params
  });
}

export function findPollActivitysCount(params) {
  return request({
    url: pollActivityApi.findCount,
    params
  });
}

export function getPollActivity(id) {
  return request({
    url: pollActivityApi.get,
    params: {
      id
    }
  });
}

export function createPollActivity(data) {
  return request({
    method: 'post',
    url: pollActivityApi.create,
    data
  });
}

export function updatePollActivity(data) {
  return request({
    method: 'post',
    url: pollActivityApi.update,
    data
  });
}