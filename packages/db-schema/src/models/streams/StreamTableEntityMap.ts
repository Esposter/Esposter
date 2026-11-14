import type { StreamTable } from "#src/models/streams/StreamTable";
import type { MessageEntity } from "#src/models/message/MessageEntity";
import type { MessageMetadataEntity } from "#src/models/message/metadata/MessageMetadataEntity";
import type { MessageMetadataType } from "#src/models/message/metadata/MessageMetadataType";
import type { ModerationLogEntity } from "#src/models/message/ModerationLogEntity";
import type { ModerationNoteEntity } from "#src/models/message/ModerationNoteEntity";
import type { ProgramParticipantEntity } from "#src/models/program/ProgramParticipantEntity";
import type { ResourceActivityEntity } from "#src/models/resource/ResourceActivityEntity";
import type { ResourceViewEntity } from "#src/models/resource/ResourceViewEntity";
import type { SurveyResponseEntity } from "#src/models/survey/SurveyResponseEntity";

export interface StreamTableEntityMap {
  [StreamTable.Messages]: MessageEntity;
  [StreamTable.MessagesMetadata]: MessageMetadataEntity<MessageMetadataType>;
  [StreamTable.ModerationLog]: ModerationLogEntity;
  [StreamTable.ModerationNotes]: ModerationNoteEntity;
  [StreamTable.ProgramParticipants]: ProgramParticipantEntity;
  [StreamTable.ResourceActivity]: ResourceActivityEntity;
  [StreamTable.ResourceViews]: ResourceViewEntity;
  [StreamTable.SurveyResponses]: SurveyResponseEntity;
}
