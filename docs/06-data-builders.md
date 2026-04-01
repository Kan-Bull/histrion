# Data Builders

## The problem

Hardcoded test data is brittle and repetitive:

```typescript
// Bad — duplicated, fragile, hard to maintain
test('can submit contact form', async ({ contactPage }) => {
  const formData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    subject: 'customer-service',
    message: 'I need help with my order',
  };
  // ...
});

test('can submit another contact form', async ({ contactPage }) => {
  const formData = {
    firstName: 'Test2',
    lastName: 'User2',
    email: 'test2@example.com',
    subject: 'webmaster',
    message: 'The website is broken',
  };
  // ...
});
```

When the `ContactFormData` type changes (new required field, renamed property), every test breaks.

## The solution: Builders

Builders centralize defaults and expose a fluent API for overrides:

```typescript
const contact = ContactBuilder.create()
  .withSubject('customer-service')
  .withEmail('admin@test.com')
  .build();
```

Defaults handle everything you don't care about. You only specify what matters for the test.

## Creating a builder — step by step

### 1. Define the type

In `src/data/types/index.ts`:

```typescript
export interface Product {
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}
```

### 2. Create the builder class

In `src/data/builders/product.builder.ts`:

```typescript
import type { Product } from '../types';
import { Builder } from './base.builder';

export class ProductBuilder extends Builder<Product> {
  private constructor() {
    super({
      name: 'Test Product',
      price: 29.99,
      category: 'general',
      inStock: true,
    });
  }

  static create(): ProductBuilder {
    return new ProductBuilder();
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withPrice(price: number): this {
    this.data.price = price;
    return this;
  }

  withCategory(category: string): this {
    this.data.category = category;
    return this;
  }

  outOfStock(): this {
    this.data.inStock = false;
    return this;
  }
}
```

Key points:
- Constructor is `private` — use `static create()` to instantiate
- `super()` receives sensible defaults for every field
- Each `with*` method returns `this` for chaining
- `build()` is inherited from `Builder<T>` — returns a plain object

### 3. Use in tests

```typescript
// Only override what matters for this specific test
const expensiveProduct = ProductBuilder.create()
  .withPrice(999.99)
  .withCategory('premium')
  .build();

const cheapProduct = ProductBuilder.create()
  .withPrice(1.00)
  .build();

const unavailable = ProductBuilder.create()
  .outOfStock()
  .build();
```

## `buildMany()` for arrays

Generate multiple items with per-item overrides:

```typescript
// 5 products with unique names
const products = ProductBuilder.create().buildMany(5, (i) => ({
  name: `Product ${i + 1}`,
  price: 10 * (i + 1),
}));

// Result:
// [
//   { name: 'Product 1', price: 10, category: 'general', inStock: true },
//   { name: 'Product 2', price: 20, category: 'general', inStock: true },
//   ...
// ]
```

> [!tip] The override function receives the index
> Use it for unique values: emails, names, sequential IDs.

## Faker.js integration

Builders use [Faker.js](https://fakerjs.dev/) to generate realistic test data by default. This means every call to `ContactBuilder.create().build()` produces unique, realistic values — no more `test@example.com` everywhere:

```typescript
const contact = ContactBuilder.create().build();
// { firstName: 'Alexis', lastName: 'Mertz', email: 'alexis.mertz@yahoo.com',
//   subject: 'customer-service', message: 'Lorem ipsum dolor sit amet...' }
```

Override only the fields that matter for your test, and let Faker handle the rest.

## What Builder\<T\> gives you

The base class (`src/data/builders/base.builder.ts`) provides:

| Method | Purpose |
|--------|---------|
| `build()` | Returns the constructed object with defaults + overrides |
| `buildMany(count, overrideFn?)` | Returns an array of `count` objects with optional per-item overrides |

Your subclass adds the `with*` methods and the `static create()` factory.

