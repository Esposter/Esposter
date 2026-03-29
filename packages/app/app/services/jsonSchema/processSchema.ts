import { processAnyOf } from "@/services/jsonSchema/processAnyOf";
import { processItems } from "@/services/jsonSchema/processItems";
import { processOneOf } from "@/services/jsonSchema/processOneOf";
import { processProperties } from "@/services/jsonSchema/processProperties";
import { processTitle } from "@/services/jsonSchema/processTitle";
import { z } from "zod";

const processedSchemas = new WeakSet<object>();

export const processSchema = (schema: z.core.JSONSchema.JSONSchema, key?: string) => {
  if (typeof schema !== "object" || schema === null || processedSchemas.has(schema)) return;
  processedSchemas.add(schema);
  processTitle(schema, key);
  processAnyOf(schema);
  processOneOf(schema.oneOf);
  processItems(schema.items);
  processProperties(schema.properties);
};
