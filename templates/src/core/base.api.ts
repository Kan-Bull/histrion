import { type APIRequestContext, type APIResponse, request } from "@playwright/test";
import { EnvConfig } from "../config/env.config";
import { Logger } from "../utils/logger";

/**
 * Abstract base class for API clients used in test setup/teardown.
 *
 * API helpers exist so that tests can bypass the UI for precondition
 * setup and postcondition cleanup — keeping tests fast and focused.
 *
 * Usage:
 * ```ts
 * class UserAPI extends BaseAPI {
 *   async createUser(data: CreateUserPayload): Promise<User> {
 *     return this.post('/api/users', data);
 *   }
 *   async deleteUser(id: string): Promise<void> {
 *     await this.delete(`/api/users/${id}`);
 *   }
 * }
 * ```
 */
export abstract class BaseAPI {
  protected readonly log: Logger;
  private context: APIRequestContext | null = null;

  constructor() {
    this.log = new Logger(this.constructor.name);
  }

  // ──────────────────────────────────────────────
  //  Lifecycle
  // ──────────────────────────────────────────────

  protected async getContext(): Promise<APIRequestContext> {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: EnvConfig.baseUrl,
        extraHTTPHeaders: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    }
    return this.context;
  }

  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }

  // ──────────────────────────────────────────────
  //  HTTP methods
  // ──────────────────────────────────────────────

  protected async get<T>(endpoint: string): Promise<T> {
    this.log.action(`GET ${endpoint}`);
    const ctx = await this.getContext();
    const response = await ctx.get(endpoint);
    return this.handleResponse<T>(response);
  }

  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    this.log.action(`POST ${endpoint}`);
    const ctx = await this.getContext();
    const response = await ctx.post(endpoint, { data });
    return this.handleResponse<T>(response);
  }

  protected async put<T>(endpoint: string, data?: unknown): Promise<T> {
    this.log.action(`PUT ${endpoint}`);
    const ctx = await this.getContext();
    const response = await ctx.put(endpoint, { data });
    return this.handleResponse<T>(response);
  }

  protected async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    this.log.action(`PATCH ${endpoint}`);
    const ctx = await this.getContext();
    const response = await ctx.patch(endpoint, { data });
    return this.handleResponse<T>(response);
  }

  protected async delete(endpoint: string): Promise<void> {
    this.log.action(`DELETE ${endpoint}`);
    const ctx = await this.getContext();
    const response = await ctx.delete(endpoint);
    if (!response.ok()) {
      throw new Error(
        `DELETE ${endpoint} failed: ${response.status()} ${response.statusText()}`,
      );
    }
  }

  // ──────────────────────────────────────────────
  //  Response handling
  // ──────────────────────────────────────────────

  private async handleResponse<T>(response: APIResponse): Promise<T> {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`API ${response.url()} failed: ${response.status()} — ${body}`);
    }
    return response.json() as Promise<T>;
  }
}
