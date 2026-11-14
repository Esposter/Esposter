import type { TableMapper } from "#src/models/cutover/TableMapper";

import { moderationLogTableMapper } from "#src/services/cutover/tables/moderationLogTableMapper";
import { moderationNoteTableMapper } from "#src/services/cutover/tables/moderationNoteTableMapper";
import { programParticipantTableMapper } from "#src/services/cutover/tables/programParticipantTableMapper";
import { resourceActivityTableMapper } from "#src/services/cutover/tables/resourceActivityTableMapper";
import { resourceViewTableMapper } from "#src/services/cutover/tables/resourceViewTableMapper";
import { surveyResponseTableMapper } from "#src/services/cutover/tables/surveyResponseTableMapper";

// Every former Azure Table with a typed D1 table, in copy order. Each references only rows copy-core writes, so the order among them is
// free. Messages, and their reactions, are not here: they are imported into their rooms' objects (services/cutover/messages/)
export const tableMappers: TableMapper[] = [
  moderationLogTableMapper,
  moderationNoteTableMapper,
  programParticipantTableMapper,
  resourceActivityTableMapper,
  resourceViewTableMapper,
  surveyResponseTableMapper,
];
