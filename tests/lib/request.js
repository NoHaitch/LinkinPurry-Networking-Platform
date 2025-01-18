import { ENDPOINT } from "./config.js";
import http from "k6/http";

export function get(path, { token } = {}) {
  return http.get(ENDPOINT + path, {
    headers: {
      Cookie: `token=${token}`,
    },
  });
}

export function post(path, body, { token } = {}) {
  return http.post(ENDPOINT + path, JSON.stringify(body), {
    headers: {
      Cookie: `token=${token}`,
      "Content-Type": "application/json",
    },
  });
}
