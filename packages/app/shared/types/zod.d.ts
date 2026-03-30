import type { PartialCompObject } from "@json-layout/vocabulary";

declare module "zod" {
  interface GlobalMeta {
    layout?: Partial<PartialCompObject>;
    uniqueColumnName?: boolean;
  }
}

export {};
