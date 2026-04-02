# Glossary

A plain-language reference for every concept used in the framework. If a term confuses you, find it here.

## Architecture

| Term                  | What it is                                                                                                                 | Concrete example                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Page Object**       | A class that represents ONE page of your app. Contains locators (private) and methods (public). Tests never see selectors. | `LoginPage` knows the "username" field and exposes `fillCredentials()`. The test calls `fillCredentials()`.                   |
| **Component**         | A reusable UI piece that appears on 2+ pages. Scoped to a root element. Composed inside Pages.                             | `NavbarComponent`, `TableComponent`, `ModalComponent`. `DashboardPage` "owns" a `TableComponent`.                            |
| **Fixture**           | A factory that creates a Page Object and injects it into the test automatically. Declare once, use everywhere.             | The test receives `loginPage` as a parameter without ever writing `new LoginPage(page)`.                                     |
| **Core / Base class** | Abstract classes that all Pages and Components inherit from. Contains shared methods (fill, click, navigate, log).         | `BasePage` provides `this.fill()`, `this.click()`, `this.log`. `LoginPage` inherits them via `extends`.                      |
| **Builder**           | A pattern for constructing test data objects with sensible defaults and chainable overrides.                               | `UserBuilder.create().withRole("admin").build()` creates a user with everything valid and an admin role.                      |
| **Abstraction**       | Hiding complexity behind a simple interface. Each layer hides the details of the layer below it.                           | The test says `fillCredentials()`. It doesn't know that `fillCredentials` calls `clear()`, then `fill()`, then logs. It doesn't need to. |
| **Composition**       | When a Page Object "owns" Component instances rather than inheriting from them. Combines pieces like LEGO.                 | `DashboardPage` has a `TableComponent` and a `ModalComponent` as properties. It delegates table actions to `TableComponent`. |

## TypeScript

| Term | What it is | Concrete example |
|------|-----------|-----------------|
| **class** | A blueprint for creating objects. Contains properties (data) and methods (actions). | `class LoginPage { ... }` is the blueprint. Each test receives an instance of this blueprint. |
| **extends** | Inheritance. The child class gets all methods and properties from the parent. | `LoginPage extends BasePage` means LoginPage "is a" BasePage and inherits `fill()`, `click()`, etc. |
| **constructor** | The function that runs when an instance of the class is created. Initializes properties. | `constructor(page)` saves the browser reference so that methods can use it later. |
| **super()** | Calls the parent's constructor. Required when you `extends` a class. | `super(page)` passes the browser to `BasePage` so it can set up the logger and helpers. |
| **private** | Only accessible inside the class. Tests cannot touch it. | `private readonly submitButton = ...` — the test CANNOT do `loginPage.submitButton`. |
| **readonly** | Assigned once, never changed. A safeguard against accidental modification. | `readonly path = "/login"` can never be overwritten by mistake. |
| **async / await** | Mechanism to wait for an action to finish before moving to the next one. | `await page.click()` waits for the click to complete. Without `await`, the code continues without waiting. |
| **export** | Makes a class/function/type available to other files that import it. | `export class LoginPage` lets the fixture file do `import { LoginPage }`. |
| **import** | Pulls a class/function/type from another file into the current one. | `import { LoginPage } from "../pages/login.page"` brings the class in. |
| **interface** | Defines the shape of an object: which fields, which types. No logic, just the contract. | `interface LoginCredentials { username: string; ... }` guarantees every login has a `username`. |
| **type / union** | Restricts the possible values of a variable. | `type Role = "admin" \| "user" \| "readonly"` prevents writing `"blabla"`. |
| **...spread** | Copies all properties of an object into another. Fields listed after the spread override. | `{ ...validData, username: "bad" }` takes everything from `validData` and replaces just `username`. |
| **generics `<T>`** | A placeholder type that gets filled in when you use the class. Makes code reusable across types. | `Builder<T>` works with any type. `Builder<User>` builds users, `Builder<LoginCredentials>` builds credentials. |
| **Promise\<void\>** | The return type of an async function that doesn't return a value. Just signals "I'm done". | `async fillCredentials(): Promise<void>` means "this function does something async and returns nothing". |

## Playwright

| Term                | What it is                                                                                            | Concrete example                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Locator**         | A reference to a DOM element. Doesn't search immediately — only when you act on it.                   | `page.getByLabel("Username")` creates a locator. The `.fill("john")` triggers the search + action.               |
| **getByRole**       | Finds an element by its accessible role (button, link, alert...). Most resilient strategy.            | `page.getByRole("button", { name: "Submit" })` finds the button like a screen reader would.                      |
| **getByLabel**      | Finds an input by the text of its associated label.                                                   | `page.getByLabel("Username")` finds the input tied to the "Username" label.                                      |
| **getByTestId**     | Finds an element by its `data-testid` attribute (or `data-test` if configured).                       | `page.getByTestId("login-submit")` looks for `data-testid="login-submit"`.                                      |
| **expect**          | Assertion: checks that a condition is true. If not, the test fails.                                   | `expect(alert).toBeVisible()` fails if the alert doesn't appear within the timeout.                              |
| **test.describe**   | A group of related tests. Just organization, no logic.                                                | `test.describe("Login", () => { ... })` groups all login tests together.                                         |
| **test.beforeEach** | Code that runs before each test in the group. Ideal for navigating to the page.                       | `test.beforeEach(async () => { await loginPage.navigate(); })` opens the page before each test.                  |
| **storageState**    | Saved browser state (cookies, localStorage) from a logged-in session. Lets tests skip the login flow. | Global setup logs in once, saves to `auth/admin.json`. Tests reuse that state — no login needed.                 |
| **testIdAttribute** | Config option that tells Playwright which HTML attribute `getByTestId` should look for.               | `testIdAttribute: "data-test"` makes `getByTestId("username")` search `data-test="username"`.                    |
| **trace**           | A recording of everything that happened during a test: DOM snapshots, network, console, screenshots.  | `trace: "on-first-retry"` records a trace only when a test fails and retries — useful for debugging CI failures. |

## Project structure

| Term               | What it is                                                 | Where it lives                         |
| ------------------ | ---------------------------------------------------------- | -------------------------------------- |
| **spec file**      | A test file. Contains `test.describe` and `test()` blocks. | `tests/e2e/*.spec.ts`                  |
| **page file**      | A Page Object file. One per page of your app.              | `src/pages/*.page.ts`                  |
| **component file** | A Component file. One per reusable UI element.             | `src/components/*.component.ts`        |
| **fixture file**   | Registers all Page Objects as injectable fixtures.         | `src/fixtures/index.ts`                |
| **builder file**   | A data builder. One per domain type.                       | `src/data/builders/*.builder.ts`       |
| **types file**     | Shared interfaces and types for test data.                 | `src/data/types/index.ts`              |
| **config file**    | Environment URLs, timeouts, retries, credentials.          | `src/config/env.config.ts`             |
| **reporter**       | Custom test report generator. Runs after all tests.        | `src/reporters/html-report.ts`         |
