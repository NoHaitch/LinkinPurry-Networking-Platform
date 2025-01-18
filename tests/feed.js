import { check } from "k6";
import { login } from "./lib/auth.js";
import { get } from "./lib/request.js";

export let options = {
  stages: [
    { duration: "5s", target: 50 },
    { duration: "10s", target: 100 },
    { duration: "5s", target: 50 },
  ],
  thresholds: {
    http_req_duration: ["avg<8000", "p(95)<20000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const userId = Math.random() < 0.5 ? 1 : 2;

  const token = login(`user${userId}wbd`, `password${userId}`);

  let cursor = getNextCursor(token);

  for (let i = 0; i < 20 && cursor; i++) {
    cursor = getNextCursor(token, cursor);
  }
}

function getNextCursor(token, cursor) {
  const res = get("/api/feed?limit=100" + (cursor ? "&cursor=" + cursor : ""), {
    token,
  });

  check(res, {
    "status is ok": (r) => r.status === 200,
  });

  const data = res.json();

  if (!data.body) {
    console.log(data);
  }

  return data.body.cursor;
}
