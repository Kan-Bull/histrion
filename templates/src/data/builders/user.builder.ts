import type { User } from "../types";
import { Builder } from "./base.builder";

/**
 * Fluent builder for User test data.
 *
 * ```ts
 * const admin = UserBuilder.create()
 *   .withRole('admin')
 *   .withEmail('admin@test.com')
 *   .build();
 *
 * const users = UserBuilder.create().buildMany(5, (i) => ({
 *   email: `user-${i}@test.com`,
 * }));
 * ```
 */
export class UserBuilder extends Builder<User> {
  private constructor() {
    super({
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: "user",
    });
  }

  static create(): UserBuilder {
    return new UserBuilder();
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withFirstName(firstName: string): this {
    this.data.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.data.lastName = lastName;
    return this;
  }

  withRole(role: User["role"]): this {
    this.data.role = role;
    return this;
  }

  /** Convenience: build a user with a unique email based on index */
  static indexed(index: number): User {
    return UserBuilder.create()
      .withEmail(`user-${index}@test.com`)
      .withFirstName(`User`)
      .withLastName(`${index}`)
      .build();
  }
}
