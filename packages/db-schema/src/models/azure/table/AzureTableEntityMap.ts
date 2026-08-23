import type { AzureTable } from "#src/models/azure/table/AzureTable";
import type { MessageEntity } from "#src/models/message/MessageEntity";
import type { MessageMetadataEntity } from "#src/models/message/metadata/MessageMetadataEntity";
import type { MessageMetadataType } from "#src/models/message/metadata/MessageMetadataType";
import type { ModerationLogEntity } from "#src/models/message/ModerationLogEntity";
import type { ModerationNoteEntity } from "#src/models/message/ModerationNoteEntity";
import type { WebhookMessageEntity } from "#src/models/message/WebhookMessageEntity";
import type { ProgramParticipantEntity } from "#src/models/program/ProgramParticipantEntity";
import type { ResourceActivityEntity } from "#src/models/resource/ResourceActivityEntity";
import type { ResourceViewEntity } from "#src/models/resource/ResourceViewEntity";
import type { SurveyResponseEntity } from "#src/models/survey/SurveyResponseEntity";
import type { TableEntity } from "@azure/data-tables";

export interface AzureTableEntityMap {
  [AzureTable.Messages]: MessageEntity | WebhookMessageEntity;
  [AzureTable.MessagesAscending]: TableEntity;
  [AzureTable.MessagesMetadata]: MessageMetadataEntity<MessageMetadataType>;
  [AzureTable.ModerationLog]: ModerationLogEntity;
  [AzureTable.ModerationNotes]: ModerationNoteEntity;
  [AzureTable.ProgramParticipants]: ProgramParticipantEntity;
  [AzureTable.ResourceActivity]: ResourceActivityEntity;
  [AzureTable.ResourceViews]: ResourceViewEntity;
  [AzureTable.SurveyResponses]: SurveyResponseEntity;
}
