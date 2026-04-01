import * as fs from "node:fs";
import type { FullConfig } from "@playwright/test";
import { Logger } from "./src/utils/logger";

const log = new Logger("GlobalSetup");

async function globalSetup(_config: FullConfig): Promise<void> {
  log.step("Starting global setup");

  // Create required directories
  fs.mkdirSync("auth", { recursive: true });
  fs.mkdirSync("reports", { recursive: true });
  fs.mkdirSync("screenshots", { recursive: true });

  log.step("Global setup complete");
}

export default globalSetup;
