import type { TableEntity } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";
import { JsonObject, JsonProperty } from "typescript-json-serializer";

export type CompositeKey = OmitIndexSignature<TableEntity>;

@JsonObject()
export class CompositeKeyEntity implements CompositeKey {
  @JsonProperty() partitionKey!: string;
  @JsonProperty() rowKey!: string;
}

export type AzureUpdateEntity<T> = CompositeKey & Partial<T>;
