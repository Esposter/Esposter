import type { uniqueColumnNameKeywordDefinition } from "@/services/ajv/keywords/uniqueColumnNameKeywordDefinition";

type AjvKeywords = Partial<Record<(typeof uniqueColumnNameKeywordDefinition)["keyword"], true>>;
// Merges into the `GlobalMeta` that `shared/types/zod.d.ts` opens. The Ajv keyword is declared on this side
// Because only the form's Ajv instance registers it, so nothing `shared/` validates may reach for it.
declare module "zod" {
  interface GlobalMeta extends AjvKeywords {}
}

export {};
