import type { TableEntity } from "@azure/data-tables";
// Record<table, Map<compositeKey, entity>>
export const MockTableDatabase: Record<string, Map<string, TableEntity>> = {};
