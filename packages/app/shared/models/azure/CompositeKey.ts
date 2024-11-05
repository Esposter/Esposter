import type { TableEntity } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";

export type CompositeKey = OmitIndexSignature<TableEntity>;
