type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[90m", // gray
  info: "\x1b[36m", // cyan
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

/**
 * Structured logger with context awareness.
 *
 * Each Page, Component, and API class gets its own Logger instance
 * with the class name as context, creating a clear trace of what
 * happened during a test.
 *
 * Output example:
 * ```
 * [14:32:01] LoginPage      → Navigating to /login
 * [14:32:01] LoginPage      ⚡ Fill "username" with "admin@example.com"
 * [14:32:02] LoginPage      ⚡ Fill "password" with "***"
 * [14:32:02] LoginPage      ⚡ Click: Submit button
 * [14:32:03] DashboardPage  → Verifying page title matches: Dashboard
 * ```
 */
export class Logger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context.padEnd(18);
  }

  /** High-level step (navigation, verification) */
  step(message: string): void {
    this.print("info", "→", message);
  }

  /** Granular interaction (click, fill, select) */
  action(message: string): void {
    this.print("debug", "⚡", message);
  }

  warn(message: string): void {
    this.print("warn", "⚠", message);
  }

  error(message: string): void {
    this.print("error", "✗", message);
  }

  private print(level: LogLevel, icon: string, message: string): void {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const color = LOG_COLORS[level];
    console.log(
      `${color}[${timestamp}]${RESET} ${BOLD}${this.context}${RESET} ${icon} ${message}`,
    );
  }
}
