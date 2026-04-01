import { faker } from "@faker-js/faker";
import type { ContactFormData, ContactSubject } from "../types";
import { Builder } from "./base.builder";

const SUBJECTS: ContactSubject[] = [
  "customer-service",
  "webmaster",
  "return",
  "payments",
];

export class ContactBuilder extends Builder<ContactFormData> {
  constructor() {
    super({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      subject: faker.helpers.arrayElement(SUBJECTS),
      message: faker.lorem.sentence({ min: 5, max: 20 }),
    });
  }

  static create(): ContactBuilder {
    return new ContactBuilder();
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withSubject(subject: ContactSubject): this {
    this.data.subject = subject;
    return this;
  }

  withMessage(message: string): this {
    this.data.message = message;
    return this;
  }
}
