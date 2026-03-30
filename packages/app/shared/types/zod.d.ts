import type { uniqueColumnNameKeywordDefinition } from "@/services/ajv/keywords/uniqueColumnNameKeywordDefinition";
import type { PartialCompObject } from "@json-layout/vocabulary";

type AjvKeywords = {
  [K in (typeof uniqueColumnNameKeywordDefinition)["keyword"]]?: boolean;
};

declare module "zod" {
  interface GlobalMeta extends AjvKeywords {
    layout?: Partial<PartialCompObject>;
  }
}

export {};
