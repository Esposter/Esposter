import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { MessageMetadataEntity } from "#shared/models/db/message/metadata/MessageMetadataEntity";
import type { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import type { SurveyResponseEntity } from "#shared/models/db/survey/SurveyResponseEntity";
import type { AzureTable } from "@@/server/models/azure/table/AzureTable";

export interface AzureTableEntityMap {
  [AzureTable.Messages]: MessageEntity;
  [AzureTable.MessagesMetadata]: MessageMetadataEntity<MessageMetadataType>;
  [AzureTable.SurveyResponses]: SurveyResponseEntity;
}
