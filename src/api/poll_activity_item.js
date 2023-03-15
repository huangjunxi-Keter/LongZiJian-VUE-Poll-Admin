import { request } from "@/utils/request";

const pollActivityItemApi = {
  find: '/api/poll-activity-item/find',
  findCount: '/api/poll-activity-item/find-count',
  get: '/api/poll-activity-item/get',
  create: '/api/poll-activity-item/create',
  update: '/api/poll-activity-item/update',
  delete: '/api/poll-activity-item/delete',
}

export function findPollActivityItems(params) {
  return request({
    url: pollActivityItemApi.find,
    params
  });
}

export function findPollActivityItemsCount(params) {
  return request({
    url: pollActivityItemApi.findCount,
    params
  });
}

export function getPollActivityItem(id) {
  return request({
    url: pollActivityItemApi.get,
    params: {
      id
    }
  });
}

export function createPollActivityItem(data) {
  return request({
    method: 'post',
    url: pollActivityItemApi.create,
    data
  });
}

export function updatePollActivityItem(data) {
  return request({
    method: 'post',
    url: pollActivityItemApi.update,
    data
  });
}

export function deletePollActivityItem(data) {
  return request({
    method: 'post',
    url: pollActivityItemApi.delete,
    data
  });
}