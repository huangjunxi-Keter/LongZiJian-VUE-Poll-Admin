import axios from "axios";

const base = {
  address: "http://localhost:8009",
};

export function request({ url, data, params, method }) {
  return new Promise((resolve, reject) => {
    axios({
      method: method || "get",
      url: base.address + url,
      data,
      params,
    })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getImageUrl(filename) {
  return `${base.address}/api/image/${filename}`;
}

export function getRequestAddress() {
  return base.address;
}
