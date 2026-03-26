import type { WithApplicableColumnTypes } from "#shared/models/tableEditor/file/column/transformation/WithApplicableColumnTypes";

declare module "zod" {
  interface GlobalMeta extends Partial<WithApplicableColumnTypes> {
    comp?: string;
    getItems?: string;
    getProps?: string;
  }
}

export {};
