import { spawn, spawnSync } from "node:child_process";

const forwardUrl = process.env.STRIPE_WEBHOOK_FORWARD_URL ?? "http://localhost:3000/api/webhooks/stripe";
const disableStripe = process.env.DISABLE_STRIPE_LISTENER === "1";
const isVercelEnvironment = process.env.VERCEL === "1";

function hasStripeCli() {
  try {
    const result = spawnSync("stripe", ["--version"], { stdio: "ignore" });
    return result.status === 0;
  } catch {
    return false;
  }
}

const nextCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const nextArgs = ["run", "dev:next"];

const nextProcess = spawn(nextCommand, nextArgs, {
  stdio: "inherit",
  env: process.env,
});

let stripeProcess = null;

if (!disableStripe && !isVercelEnvironment && hasStripeCli()) {
  stripeProcess = spawn("stripe", ["listen", "--forward-to", forwardUrl], {
    stdio: "inherit",
    env: process.env,
  });
} else if (!disableStripe && !isVercelEnvironment) {
  console.warn("[dev] Stripe CLI not found; continuing without webhook listener.");
}

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (stripeProcess && !stripeProcess.killed) {
    stripeProcess.kill("SIGTERM");
  }

  if (!nextProcess.killed) {
    nextProcess.kill("SIGTERM");
  }

  setTimeout(() => process.exit(code), 50);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

nextProcess.on("exit", (code) => {
  if (stripeProcess && !stripeProcess.killed) {
    stripeProcess.kill("SIGTERM");
  }
  process.exit(code ?? 0);
});

if (stripeProcess) {
  stripeProcess.on("exit", (code) => {
    if (!shuttingDown && code && code !== 0) {
      console.warn("[dev] Stripe listener exited unexpectedly.");
    }
  });
}
