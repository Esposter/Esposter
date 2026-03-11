import type { ValidationRule } from "vuetify";

declare module "zod" {
  interface GlobalMeta {
    rules?: ValidationRule[];
  }
}

export {};
