type LogLevel = "step" | "action" | "success" | "warn" | "error";

const RESET = "\x1b[0m";
const DIM = "\x1b[90m";
const BOLD = "\x1b[1m";
const PURPLE = "\x1b[35m";
const CYAN = "\x1b[96m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const RED = "\x1b[91m";
const SEP = `${DIM}│${RESET}`;

const THEME: Record<LogLevel, { color: string; icon: string }> = {
  step: { color: CYAN, icon: "🔹" },
  action: { color: DIM, icon: " ▸ " },
  success: { color: GREEN, icon: "✓" },
  warn: { color: YELLOW, icon: "⚠" },
  error: { color: RED, icon: "✗" },
};

/**
 * Structured logger with context awareness.
 *
 * Each Page, Component, and API class gets its own Logger instance
 * with the class name as context, creating a clear trace of what
 * happened during a test.
 *
 * Output example:
 * ```
 * 14:32:01 ■ ContactPage     │ 🔹 Filling contact form for john@example.com
 * 14:32:01 ■ ContactPage     │    ▸ Fill "first name" with "John"
 * 14:32:02 ■ ContactPage     │    ▸ Fill "last name" with "Doe"
 * 14:32:02 ■ ContactPage     │ 🔹 Submitting contact form
 * 14:32:03 ■ ContactPage     │ ✓ Success alert visible
 * ```
 */
export class Logger {
  private readonly ctx: string;

  constructor(context: string) {
    this.ctx = context.padEnd(16);
  }

  /** High-level step (navigation, form fill, submit) */
  step(message: string): void {
    this.print("step", message);
  }

  /** Granular interaction (click, fill, select) — indented under its step */
  action(message: string): void {
    this.print("action", `  ${message}`);
  }

  /** Assertion passed */
  success(message: string): void {
    this.print("success", message);
  }

  warn(message: string): void {
    this.print("warn", message);
  }

  error(message: string): void {
    this.print("error", message);
  }

  private print(level: LogLevel, message: string): void {
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const { color, icon } = THEME[level];

    const ctxColor =
      level === "success"
        ? GREEN
        : level === "error"
          ? RED
          : level === "warn"
            ? YELLOW
            : PURPLE;

    console.log(
      `${DIM}${time}${RESET} ${ctxColor}■${RESET} ${ctxColor}${BOLD}${this.ctx}${RESET} ${SEP} ${color}${icon} ${message}${RESET}`,
    );
  }
}
