import type { TableMapper } from "#src/models/cutover/TableMapper";

import { messageEmojiTableMapper } from "#src/services/cutover/tables/messageEmojiTableMapper";
import { messageTableMapper } from "#src/services/cutover/tables/messageTableMapper";
import { moderationLogTableMapper } from "#src/services/cutover/tables/moderationLogTableMapper";
import { moderationNoteTableMapper } from "#src/services/cutover/tables/moderationNoteTableMapper";
import { programParticipantTableMapper } from "#src/services/cutover/tables/programParticipantTableMapper";
import { resourceActivityTableMapper } from "#src/services/cutover/tables/resourceActivityTableMapper";
import { resourceViewTableMapper } from "#src/services/cutover/tables/resourceViewTableMapper";
import { surveyResponseTableMapper } from "#src/services/cutover/tables/surveyResponseTableMapper";

// Every former Azure Table, in copy order: an emoji attaches to a message, so messages are copied first. Every other table
// references only rows copy-core writes, so its order among them is free
export const tableMappers: TableMapper[] = [
  messageTableMapper,
  messageEmojiTableMapper,
  moderationLogTableMapper,
  moderationNoteTableMapper,
  programParticipantTableMapper,
  resourceActivityTableMapper,
  resourceViewTableMapper,
  surveyResponseTableMapper,
];
