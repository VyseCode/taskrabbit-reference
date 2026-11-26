import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3217";
const jars = fs.mkdtempSync(path.join(os.tmpdir(), "taskrabbit-verify-"));
let passed = 0;
let failed = 0;

function request(method, url, options = {}) {
  const args = ["-s", "-o", "-", "-w", "\n%{http_code}\n%{redirect_url}", "-X", method];
  if (options.jar) {
    const file = path.join(jars, options.jar);
    args.push("-b", file, "-c", file);
  }
  if (options.body !== undefined) {
    args.push("-H", "Content-Type: application/json", "-d", JSON.stringify(options.body));
  }
  args.push(BASE + url);
  const output = execFileSync("curl", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const lines = output.split("\n");
  const redirectUrl = lines[lines.length - 1] || "";
  const code = Number(lines[lines.length - 2]);
  const text = lines.slice(0, -2).join("\n");
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { code, json, text, redirectUrl };
}

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${name} ${detail}`);
  }
}

function expect(name, response, code, predicate) {
  const okCode = response.code === code;
  const okBody = !predicate || (response.json !== null && predicate(response.json));
  check(name, okCode && okBody, `got ${response.code} ${response.text.slice(0, 140)}`);
}

function login(email, jar) {
  return request("POST", "/api/auth/login", {
    jar,
    body: { email, password: "password123" },
  });
}

function taskIdByTitle(status, title) {
  const response = request("GET", `/api/tasks?status=${status}&limit=50`);
  return response.json?.items?.find((task) => task.title === title)?.id ?? "";
}

function offerIdByTasker(jar, taskId, name) {
  const response = request("GET", `/api/tasks/${taskId}/offers`, { jar });
  return response.json?.offers?.find((offer) => offer.taskerName === name)?.id ?? "";
}

function userIdByName(name) {
  const response = request("GET", "/api/taskers?limit=50");
  return response.json?.items?.find((tasker) => tasker.name === name)?.userId ?? "";
}

function main() {
  for (const [email, jar] of [
    ["priya@example.com", "priya.txt"],
    ["marcus@example.com", "marcus.txt"],
    ["sofia@example.com", "sofia.txt"],
    ["daniel@example.com", "daniel.txt"],
    ["emma@example.com", "emma.txt"],
  ]) {
    expect(`login ${email}`, login(email, jar), 200, (body) => !!body.user?.id);
  }
  expect("login bad password", request("POST", "/api/auth/login", { body: { email: "priya@example.com", password: "wrong" } }), 401);
  expect("register", request("POST", "/api/auth/register", { jar: "verify.txt", body: { name: "Verify Client", email: "verify@example.com", password: "password123", role: "client" } }), 201);
  expect("register duplicate", request("POST", "/api/auth/register", { body: { name: "Verify Client", email: "verify@example.com", password: "password123", role: "client" } }), 409);
  expect("me anonymous", request("GET", "/api/auth/me"), 200, (body) => body.user === null);
  expect("me authenticated", request("GET", "/api/auth/me", { jar: "priya.txt" }), 200, (body) => body.user?.email === "priya@example.com");

  const t1 = taskIdByTitle("open", "Deep clean my apartment");
  const t2 = taskIdByTitle("open", "Help moving a 2BR apartment");
  const t3 = taskIdByTitle("assigned", "Fix leaky kitchen faucet");
  const t7 = taskIdByTitle("cancelled", "Pick up second-hand furniture");
  const t8 = taskIdByTitle("open", "Install a ceiling fan");
  const t5 = taskIdByTitle("completed", "Office cleaning");
  const od = offerIdByTasker("priya.txt", t1, "Daniel Kim");
  const oe = offerIdByTasker("priya.txt", t1, "Emma Wilson");
  const oo = offerIdByTasker("marcus.txt", t2, "Oliver Brown");
  const o8 = offerIdByTasker("daniel.txt", t8, "Emma Wilson");
  const oliverId = userIdByName("Oliver Brown");

  expect("tasks list", request("GET", "/api/tasks"), 200, (b) => b.total === 9 && b.items.length === 9);
  expect("tasks filter status", request("GET", "/api/tasks?status=open"), 200, (b) => b.total === 3);
  expect("tasks empty filter", request("GET", "/api/tasks?category=pet-care"), 200, (b) => b.total === 0 && b.items.length === 0);
  expect("tasks sort budget_desc", request("GET", "/api/tasks?sort=budget_desc"), 200, (b) => b.items[0].budget >= b.items[1].budget);
  expect("tasks pagination", request("GET", "/api/tasks?page=1&limit=2"), 200, (b) => b.items.length === 2 && b.hasMore && b.totalPages === 5);
  expect("task detail", request("GET", `/api/tasks/${t1}`), 200, (b) => b.task?.title === "Deep clean my apartment");
  expect("task detail missing", request("GET", "/api/tasks/000000000000000000000000"), 404);

  expect("taskers list", request("GET", "/api/taskers"), 200, (b) => b.total === 4);
  expect("taskers skill filter", request("GET", "/api/taskers?skill=cleaning"), 200, (b) => b.total === 3);
  expect("taskers minRate filter", request("GET", "/api/taskers?minRate=30"), 200, (b) => b.total === 2);
  expect("taskers maxRate filter", request("GET", "/api/taskers?maxRate=30"), 200, (b) => b.total === 2);
  expect("taskers minRating filter", request("GET", "/api/taskers?minRating=4"), 200, (b) => b.total === 2);
  expect("taskers availability filter", request("GET", "/api/taskers?availability=available"), 200, (b) => b.total === 3);
  expect("taskers sort rate_low", request("GET", "/api/taskers?sort=rate_low"), 200, (b) => b.items[0].hourlyRate === 24);
  expect("taskers sort rating", request("GET", "/api/taskers?sort=rating"), 200, (b) => b.items[0].ratingAvg === 4.5);
  expect("taskers empty", request("GET", "/api/taskers?q=zzzznothing"), 200, (b) => b.total === 0);
  expect("tasker detail", request("GET", `/api/taskers/${userIdByName("Emma Wilson")}`), 200, (b) => b.tasker?.name === "Emma Wilson" && b.reviews.length === 2);
  expect("tasker detail 404", request("GET", "/api/taskers/000000000000000000000000"), 404);
  expect("categories list", request("GET", "/api/categories"), 200, (b) => b.items.length === 10 && b.items.find((c) => c.slug === "cleaning").taskCount === 2);

  const offerBody = { price: 99, estimatedHours: 2, message: "I can help." };
  expect("offers list anonymous", request("GET", `/api/tasks/${t1}/offers`), 401);
  expect("offers list owner", request("GET", `/api/tasks/${t1}/offers`, { jar: "priya.txt" }), 200, (b) => b.offers.length === 3);
  expect("offers list non-owner", request("GET", `/api/tasks/${t1}/offers`, { jar: "daniel.txt" }), 200, (b) => b.offers.length === 1);
  expect("offer duplicate", request("POST", `/api/tasks/${t1}/offers`, { jar: "daniel.txt", body: offerBody }), 409);
  expect("offer on assigned task", request("POST", `/api/tasks/${t3}/offers`, { jar: "daniel.txt", body: offerBody }), 400);
  expect("offer on own task", request("POST", `/api/tasks/${t8}/offers`, { jar: "daniel.txt", body: offerBody }), 400);
  expect("offer on cancelled task", request("POST", `/api/tasks/${t7}/offers`, { jar: "daniel.txt", body: offerBody }), 400);
  expect("offer anonymous", request("POST", `/api/tasks/${t1}/offers`, { body: offerBody }), 401);
  expect("offer 404 task", request("POST", "/api/tasks/000000000000000000000000/offers", { jar: "daniel.txt", body: offerBody }), 404);
  expect("duplicate offer second tasker", request("POST", `/api/tasks/${t1}/offers`, { jar: "emma.txt", body: offerBody }), 409);

  expect("accept anonymous", request("POST", `/api/offers/${od}/accept`), 401);
  expect("accept non-owner", request("POST", `/api/offers/${od}/accept`, { jar: "daniel.txt" }), 403);
  expect("accept owner", request("POST", `/api/offers/${od}/accept`, { jar: "priya.txt" }), 200, (b) => b.task.status === "assigned" && b.offer.status === "accepted");
  expect("accept second offer", request("POST", `/api/offers/${oe}/accept`, { jar: "priya.txt" }), 409);
  expect("accept already accepted", request("POST", `/api/offers/${od}/accept`, { jar: "priya.txt" }), 409);
  expect("reject non-owner", request("POST", `/api/offers/${oo}/reject`, { jar: "daniel.txt" }), 403);
  expect("reject valid", request("POST", `/api/offers/${oo}/reject`, { jar: "marcus.txt" }), 200, (b) => b.offer.status === "rejected");
  expect("reject twice", request("POST", `/api/offers/${oo}/reject`, { jar: "marcus.txt" }), 400);
  expect("withdraw non-owner", request("POST", `/api/offers/${oo}/withdraw`, { jar: "daniel.txt" }), 403);
  expect("withdraw valid", request("POST", `/api/offers/${o8}/withdraw`, { jar: "emma.txt" }), 200, (b) => b.offer.status === "withdrawn");
  expect("withdraw twice", request("POST", `/api/offers/${o8}/withdraw`, { jar: "emma.txt" }), 400);
  expect("offer 404", request("POST", "/api/offers/000000000000000000000000/accept", { jar: "priya.txt" }), 404);

  expect("status anonymous", request("POST", `/api/tasks/${t3}/status`, { body: { status: "in_progress" } }), 401);
  expect("status non-owner", request("POST", `/api/tasks/${t3}/status`, { jar: "priya.txt", body: { status: "in_progress" } }), 403);
  expect("status invalid transition", request("POST", `/api/tasks/${t2}/status`, { jar: "marcus.txt", body: { status: "completed" } }), 400);
  expect("status assigned to in_progress", request("POST", `/api/tasks/${t3}/status`, { jar: "sofia.txt", body: { status: "in_progress" } }), 200, (b) => b.task.status === "in_progress");
  expect("status in_progress to completed", request("POST", `/api/tasks/${t3}/status`, { jar: "sofia.txt", body: { status: "completed" } }), 200, (b) => b.task.status === "completed");

  expect("reviews list by tasker", request("GET", `/api/reviews?taskerId=${userIdByName("Emma Wilson")}`), 200, (b) => b.items.length === 2);
  expect("reviews list by task", request("GET", `/api/reviews?taskId=${t5}`), 200, (b) => b.items.length === 1);
  expect("reviews list empty", request("GET", `/api/reviews?taskId=${t8}`), 200, (b) => b.items.length === 0);
  expect("reviews list no filter", request("GET", "/api/reviews"), 400);
  expect("review anonymous", request("POST", "/api/reviews", { body: { taskId: t3, rating: 5, comment: "hi" } }), 401);
  expect("review before completion", request("POST", "/api/reviews", { jar: "priya.txt", body: { taskId: t1, rating: 5, comment: "early" } }), 400);
  expect("review non-owner", request("POST", "/api/reviews", { jar: "priya.txt", body: { taskId: t5, rating: 5, comment: "not mine" } }), 403);
  expect("review duplicate", request("POST", "/api/reviews", { jar: "marcus.txt", body: { taskId: t5, rating: 5, comment: "again" } }), 409);
  expect("review bad rating", request("POST", "/api/reviews", { jar: "sofia.txt", body: { taskId: t3, rating: 6, comment: "bad" } }), 400);
  expect("review valid", request("POST", "/api/reviews", { jar: "sofia.txt", body: { taskId: t3, rating: 5, comment: "Fixed the faucet." } }), 201, (b) => b.review.rating === 5);
  expect("review duplicate after create", request("POST", "/api/reviews", { jar: "sofia.txt", body: { taskId: t3, rating: 3, comment: "again" } }), 409);
  expect("aggregate rating updated", request("GET", `/api/taskers/${oliverId}`), 200, (b) => b.tasker.ratingAvg === 5 && b.tasker.ratingCount === 1 && b.tasker.completedTasks >= 1);

  expect("task create anonymous", request("POST", "/api/tasks", { body: { category: "cleaning", title: "A valid task title", description: "A sufficiently long description", location: "Austin, TX", date: "2027-01-01T00:00:00.000Z", budget: 100 } }), 401);
  expect("task create past date", request("POST", "/api/tasks", { jar: "priya.txt", body: { category: "cleaning", title: "A valid task title", description: "A sufficiently long description", location: "Austin, TX", date: "2020-01-01T00:00:00.000Z", budget: 100 } }), 400);
  expect("task create bad category", request("POST", "/api/tasks", { jar: "priya.txt", body: { category: "nope", title: "A valid task title", description: "A sufficiently long description", location: "Austin, TX", date: "2027-01-01T00:00:00.000Z", budget: 100 } }), 400);
  expect("task create invalid body", request("POST", "/api/tasks", { jar: "priya.txt", body: { title: "x" } }), 400);

  const created = request("POST", "/api/tasks", {
    jar: "verify.txt",
    body: { category: "handyman", title: "Verify happy path task", description: "A full workflow task for verification", location: "Austin, TX", date: "2027-02-01T00:00:00.000Z", budget: 250 },
  });
  expect("task create valid", created, 201, (b) => !!b.task?.id);
  const newTaskId = created.json?.task?.id ?? "";
  expect("patch non-owner", request("PATCH", `/api/tasks/${newTaskId}`, { jar: "priya.txt", body: { budget: 999 } }), 403);
  expect("patch anonymous", request("PATCH", `/api/tasks/${newTaskId}`, { body: { budget: 999 } }), 401);
  expect("patch owner", request("PATCH", `/api/tasks/${newTaskId}`, { jar: "verify.txt", body: { budget: 260 } }), 200, (b) => b.task.budget === 260);
  expect("happy path offer", request("POST", `/api/tasks/${newTaskId}/offers`, { jar: "daniel.txt", body: offerBody }), 201, (b) => b.offer.status === "pending");
  expect("happy path second offer", request("POST", `/api/tasks/${newTaskId}/offers`, { jar: "emma.txt", body: offerBody }), 201);
  const newOffer = offerIdByTasker("verify.txt", newTaskId, "Daniel Kim");
  expect("happy path accept", request("POST", `/api/offers/${newOffer}/accept`, { jar: "verify.txt" }), 200, (b) => b.task.status === "assigned");
  expect("happy path start", request("POST", `/api/tasks/${newTaskId}/status`, { jar: "verify.txt", body: { status: "in_progress" } }), 200);
  expect("happy path complete", request("POST", `/api/tasks/${newTaskId}/status`, { jar: "verify.txt", body: { status: "completed" } }), 200, (b) => b.task.status === "completed");
  expect("happy path review", request("POST", "/api/reviews", { jar: "verify.txt", body: { taskId: newTaskId, rating: 4, comment: "Great" } }), 201);
  expect("cancel non-owner", request("DELETE", `/api/tasks/${newTaskId}`, { jar: "priya.txt" }), 403);

  expect("taskers/me anonymous", request("GET", "/api/taskers/me"), 401);
  expect("profile create", request("POST", "/api/taskers/me", { jar: "verify.txt", body: { skills: ["Testing"], hourlyRate: 20, location: "Austin, TX", bio: "Tester", availability: "available" } }), 201, (b) => b.profile?.skills[0] === "Testing");
  expect("profile create duplicate", request("POST", "/api/taskers/me", { jar: "verify.txt", body: { skills: ["Testing"], hourlyRate: 20, location: "Austin, TX", bio: "Tester", availability: "available" } }), 409);
  expect("profile patch", request("PATCH", "/api/taskers/me", { jar: "verify.txt", body: { hourlyRate: 33 } }), 200, (b) => b.profile.hourlyRate === 33);
  expect("profile invalid", request("POST", "/api/taskers/me", { jar: "marcus.txt", body: { skills: [], hourlyRate: -1 } }), 400);

  expect("dashboard anonymous", request("GET", "/api/dashboard"), 401);
  expect("dashboard client", request("GET", "/api/dashboard", { jar: "priya.txt" }), 200, (b) => b.dashboard.client.taskCount === 3 && b.dashboard.client.offers.length > 0);
  expect("dashboard tasker", request("GET", "/api/dashboard", { jar: "emma.txt" }), 200, (b) => b.dashboard.tasker.earnings === 185 && b.dashboard.tasker.completedCount === 2);

  for (const [url, label] of [
    ["/login", "login page"],
    ["/register", "register page"],
    ["/marketplace", "marketplace page"],
    ["/tasks", "tasks page"],
    ["/tasks/new", "new task page"],
    [`/tasks/${t1}`, "task detail page"],
    ["/taskers", "taskers page"],
    [`/taskers/${userIdByName("Emma Wilson")}`, "tasker detail page"],
    ["/taskers/me", "tasker profile page"],
    ["/categories", "categories page"],
    ["/dashboard", "dashboard page"],
  ]) {
    const response = request("GET", url, { jar: "priya.txt" });
    check(label, response.code === 200 && response.text.length > 500, `got ${response.code}`);
  }
  const redirect = request("GET", "/marketplace");
  check("protected page redirects", redirect.code === 307 && redirect.redirectUrl.includes("/login"), `got ${redirect.code} ${redirect.redirectUrl}`);
  const missing = request("GET", "/this-page-does-not-exist", { jar: "priya.txt" });
  check("unknown page 404", missing.code === 404, `got ${missing.code}`);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
