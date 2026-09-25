import type { SchemaFormLayout } from "#shared/models/schemaForm/SchemaFormLayout";

declare module "zod" {
  interface GlobalMeta {
    layout?: SchemaFormLayout;
  }
}

export {};
