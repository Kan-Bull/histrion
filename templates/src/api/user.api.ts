import { BaseAPI } from "../core/base.api";
import type { User } from "../data/types";

/**
 * API client for user management.
 *
 * Used in test setup/teardown to create or clean up test data
 * via the API instead of through the UI — faster and more reliable.
 *
 * Usage in global setup:
 * ```ts
 * const api = new UserAPI();
 * await api.createUser(UserBuilder.create().withRole('admin').build());
 * await api.dispose();
 * ```
 */
export class UserAPI extends BaseAPI {
  async createUser(user: User): Promise<User> {
    this.log.step(`Creating user via API: ${user.email}`);
    return this.post<User>("/api/users", user);
  }

  async getUser(id: string): Promise<User> {
    return this.get<User>(`/api/users/${id}`);
  }

  async deleteUser(id: string): Promise<void> {
    this.log.step(`Deleting user via API: ${id}`);
    return this.delete(`/api/users/${id}`);
  }

  async listUsers(): Promise<User[]> {
    return this.get<User[]>("/api/users");
  }
}
