import type { JSONSchemaDefinition } from "@/models/jsonSchema/JSONSchemaDefinition";
import type { JSONSchema7 } from "json-schema";
import type { Except } from "type-fest";

export type JSONSchema<T extends object> = Except<JSONSchema7, "properties"> &
  Record<string, unknown> & {
    properties?: {
      [P in keyof T]: JSONSchemaDefinition;
    };
  };
