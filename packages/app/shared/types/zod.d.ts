import type { WithAppliesTo } from "#shared/models/tableEditor/file/column/transformation/WithAppliesTo";

declare module "zod" {
  interface GlobalMeta extends Partial<WithAppliesTo> {
    comp?: string;
    getItems?: string;
    getProps?: string;
  }
}

export {};
