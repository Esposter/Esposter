import type { TableEntity } from "@azure/data-tables";
// Record<table, Map<compositeKey, entity>>
export const MockTableDatabase: Map<string, Map<string, TableEntity>> = new Map<string, Map<string, TableEntity>>();
