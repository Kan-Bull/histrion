/**
 * Generic builder base class implementing the fluent builder pattern.
 *
 * Subclasses define domain-specific `with*` methods that return `this`,
 * enabling chainable construction of test data.
 *
 * ```ts
 * const user = UserBuilder.create()
 *   .withEmail('john@example.com')
 *   .withRole('admin')
 *   .build();
 * ```
 *
 * @template T The type being built
 */
export abstract class Builder<T> {
  protected data: Partial<T>;

  protected constructor(defaults: T) {
    this.data = { ...defaults };
  }

  /** Returns the built object, filling any gaps with defaults. */
  build(): T {
    return { ...this.data } as T;
  }

  /** Build an array of N items with optional per-item overrides. */
  buildMany(count: number, overrides?: (index: number) => Partial<T>): T[] {
    return Array.from({ length: count }, (_, i) => {
      const base = this.build();
      return overrides ? { ...base, ...overrides(i) } : base;
    });
  }
}
