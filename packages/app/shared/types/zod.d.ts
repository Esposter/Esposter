import type { uniqueColumnNameKeywordDefinition } from "@/services/ajv/keywords/uniqueColumnNameKeywordDefinition";
import type { PartialCompObject } from "@json-layout/vocabulary";

type AjvKeywords = Partial<Record<(typeof uniqueColumnNameKeywordDefinition)["keyword"], true>>;

declare module "zod" {
  interface GlobalMeta extends AjvKeywords {
    isHidden?: true;
    layout?: Partial<PartialCompObject>;
  }
}

export {};
