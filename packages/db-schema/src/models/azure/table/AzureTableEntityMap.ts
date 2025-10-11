import type { AzureTable } from "@/models/azure/table/AzureTable";
import type { CompositeKey } from "@/models/azure/table/CompositeKey";
import type { MessageEntity } from "@/models/message/MessageEntity";
import type { MessageMetadataEntity } from "@/models/message/metadata/MessageMetadataEntity";
import type { MessageMetadataType } from "@/models/message/metadata/MessageMetadataType";
import type { WebhookMessageEntity } from "@/models/message/WebhookMessageEntity";
import type { SurveyResponseEntity } from "@/models/survey/SurveyResponseEntity";

export interface AzureTableEntityMap {
  [AzureTable.Messages]: MessageEntity | WebhookMessageEntity;
  [AzureTable.MessagesAscending]: CompositeKey;
  [AzureTable.MessagesMetadata]: MessageMetadataEntity<MessageMetadataType>;
  [AzureTable.SurveyResponses]: SurveyResponseEntity;
}
