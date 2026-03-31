/**
 * Test user credentials.
 *
 * These map to test accounts provisioned in each environment.
 * Passwords should come from environment variables or a vault.
 */
export interface TestUser {
  username: string;
  password: string;
  role: string;
  displayName: string;
}

export const users: Record<string, TestUser> = {
  admin: {
    username: process.env.ADMIN_USER ?? "admin@example.com",
    password: process.env.ADMIN_PASS ?? "admin-password",
    role: "admin",
    displayName: "Admin User",
  },
  standard: {
    username: process.env.STANDARD_USER ?? "user@example.com",
    password: process.env.STANDARD_PASS ?? "user-password",
    role: "user",
    displayName: "Standard User",
  },
  readonly: {
    username: process.env.READONLY_USER ?? "readonly@example.com",
    password: process.env.READONLY_PASS ?? "readonly-password",
    role: "readonly",
    displayName: "Read-Only User",
  },
};
