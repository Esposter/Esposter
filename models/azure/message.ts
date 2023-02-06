import { JsonObject, JsonProperty } from "typescript-json-serializer";

@JsonObject()
export class MessageEntity {
  @JsonProperty() partitionKey!: string;
  @JsonProperty() rowKey!: string;
  @JsonProperty() creatorId!: string;
  @JsonProperty() message!: string;
  @JsonProperty() createdAt!: Date;
}
