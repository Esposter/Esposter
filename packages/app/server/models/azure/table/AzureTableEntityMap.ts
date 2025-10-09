import type { MessageMetadataEntity } from "#shared/models/db/message/metadata/MessageMetadataEntity";
import type { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import type { SurveyResponseEntity } from "#shared/models/db/survey/SurveyResponseEntity";
import type { AzureTable } from "@@/server/models/azure/table/AzureTable";
import type { MessageEntity } from "@esposter/db";
import type { CompositeKey } from "@esposter/shared";

export interface AzureTableEntityMap {
  [AzureTable.Messages]: MessageEntity;
  [AzureTable.MessagesAscending]: CompositeKey;
  [AzureTable.MessagesMetadata]: MessageMetadataEntity<MessageMetadataType>;
  [AzureTable.SurveyResponses]: SurveyResponseEntity;
}
