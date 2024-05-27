import type { JSONSchemaDefinition } from "@/models/jsonSchema/JSONSchemaDefinition";
import type { JSONSchema7 } from "json-schema";

export type JSONSchema = JSONSchema7 & { properties: Record<string, JSONSchemaDefinition> };
