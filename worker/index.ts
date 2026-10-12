import { CampaignWorker } from "./campaign-worker";

const worker = new CampaignWorker();

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Gracefully shutting down worker...");
  worker.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Gracefully shutting down worker...");
  worker.stop();
  process.exit(0);
});

// Start persistent loop
worker.start().catch((err) => {
  console.error("Fatal worker error:", err);
  process.exit(1);
});
