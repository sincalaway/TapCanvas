#!/usr/bin/env node
import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();

function run(cmd, opts = {}) {
  const [c, ...args] = cmd.split(" ");
  const res = spawnSync(c, args, { stdio: "inherit", shell: true, ...opts });
  if (res.status !== 0) process.exit(res.status || 1);
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function init() {
  // basic folders
  [
    "apps/web",
    "apps/compose",
    "packages/schemas",
    "packages/sdk",
    "packages/pieces",
    "infra/activepieces/flows"
  ].forEach((p) => ensureDir(path.join(root, p)));

  // docker compose stub
  const dc = path.join(root, "infra/activepieces/docker-compose.yml");
  if (!fs.existsSync(dc)) {
    fs.writeFileSync(
      dc,
      `version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ap
      POSTGRES_PASSWORD: ap
      POSTGRES_DB: ap
    ports:
      - '5432:5432'
  redis:
    image: redis:7
    ports:
      - '6379:6379'
  activepieces:
    image: activepieces/activepieces:latest
    environment:
      AP_POSTGRES_USERNAME: ap
      AP_POSTGRES_PASSWORD: ap
      AP_POSTGRES_HOST: postgres
      AP_POSTGRES_PORT: 5432
      AP_POSTGRES_DATABASE: ap
      AP_REDIS_HOST: redis
      AP_REDIS_PORT: 6379
      AP_FRONTEND_URL: http://localhost:4200
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - redis
`
    );
  }

  const exampleFlow = path.join(
    root,
    "infra/activepieces/flows/example.flow.json"
  );
  if (!fs.existsSync(exampleFlow)) {
    fs.writeFileSync(
      exampleFlow,
      JSON.stringify({ name: "example", version: 1, steps: [] }, null, 2)
    );
  }

  console.log("Initialized TapCanvas scaffold.");
}

function detectCompose() {
  try {
    execSync("docker compose version", { stdio: "ignore" });
    return "docker compose";
  } catch {
    try {
      execSync("docker-compose --version", { stdio: "ignore" });
      return "docker-compose";
    } catch {
      console.error("Neither 'docker compose' nor 'docker-compose' is available.");
      process.exit(1);
    }
  }
}

function compose(sub) {
  const cwd = { cwd: path.join(root, "infra/activepieces") };
  const base = detectCompose();
  if (sub === "up") run(`${base} up -d`, cwd);
  else if (sub === "down") run(`${base} down`, cwd);
  else if (sub === "logs") run(`${base} logs -f`, cwd);
  else {
    console.log("Usage: tapcanvas compose <up|down|logs>");
  }
}

function web(sub) {
  if (sub === "dev") run("pnpm --filter @tapcanvas/web dev");
  else if (sub === "build") run("pnpm --filter @tapcanvas/web build");
  else console.log("Usage: tapcanvas web <dev|build>");
}

function flows(sub) {
  const flowsDir = path.join(root, "infra/activepieces/flows");
  ensureDir(flowsDir);
  if (sub === "list") {
    const files = fs.readdirSync(flowsDir).filter((f) => f.endsWith(".json"));
    files.forEach((f) => console.log(path.join("infra/activepieces/flows", f)));
  } else {
    console.log("Usage: tapcanvas flows list");
  }
}

function doctor() {
  try {
    execSync("pnpm --version", { stdio: "ignore" });
    console.log("pnpm: OK");
  } catch {
    console.log("pnpm: MISSING (install from https://pnpm.io)");
  }
  try {
    execSync("docker --version", { stdio: "ignore" });
    console.log("docker: OK");
  } catch {
    console.log("docker: MISSING (install Docker Desktop)");
  }
}

function usage() {
  console.log(`TapCanvas CLI

Usage:
  tapcanvas init                     Initialize folders/config
  tapcanvas web <dev|build>          Run web app tasks
  tapcanvas compose <up|down|logs>   Manage Activepieces stack
  tapcanvas flows list               List example flows
  tapcanvas doctor                   Check local tooling
`);
}

const [,, cmd, sub] = process.argv;
switch (cmd) {
  case "init":
    init();
    break;
  case "compose":
    compose(sub);
    break;
  case "web":
    web(sub);
    break;
  case "flows":
    flows(sub);
    break;
  case "doctor":
    doctor();
    break;
  default:
    usage();
}
