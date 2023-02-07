import type { TableEntity } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";
import { JsonObject, JsonProperty } from "typescript-json-serializer";

export type CompositeKey = OmitIndexSignature<TableEntity>;

@JsonObject()
export class CompositeKeyEntity implements CompositeKey {
  @JsonProperty() partitionKey!: string;
  @JsonProperty() rowKey!: string;
}

export type AzureEntity<T> = TableEntity<Record<keyof T, string | number | Date>>;
export type AzureUpdateEntity<T> = TableEntity<Partial<AzureEntity<T>>>;
