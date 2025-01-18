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
  const userId = Math.floor(Math.random() * 100) + 1;
  const username = `user${userId}wbd`;
  const password = `password${userId}`;
  let token = login(username, password);

  const res = get("/api/profile/" + userId, { token });

  check(res, {
    "status is ok": (r) => r.status === 200,
  });

  const data = res.json();

  if (!data.body) {
    console.log(data);
  }

  check(data, {
    "data is ok": (d) => d.body.username === username,
  });

  const otherUserId = ((userId + 1) % 100) + 1;

  const otherProfile = get("/api/profile/" + otherUserId, {
    token,
  });

  check(otherProfile, {
    "other profile is ok": (p) => p.status === 200,
  });

  const otherProfileData = otherProfile.json().body;

  check(otherProfileData, {
    "other profile data is ok": (p) => p.username === `user${otherUserId}wbd`,
  });
}
