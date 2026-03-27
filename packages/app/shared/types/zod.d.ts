import type { ApplicableColumnTypes } from "#shared/models/tableEditor/file/column/transformation/ApplicableColumnTypes";

declare module "zod" {
  interface GlobalMeta extends Partial<ApplicableColumnTypes> {
    comp?: string;
    getItems?: string;
    getProps?: string;
  }
}

export {};
