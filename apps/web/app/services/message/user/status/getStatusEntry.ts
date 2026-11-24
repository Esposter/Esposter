import type { UpsertStatusInput } from "#shared/models/db/user/UpsertStatusInput";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { statusTable } from "#src/services/message/user/status/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";
import { omitUndefined } from "@esposter/shared";

// A status the person sets shows on the row the store holds for them. A person with no row yet has nothing to change,
// So their first status is drawn when the server answers it
export const getStatusEntry = (userId: string, input: UpsertStatusInput): Entry =>
  getHeldRowEntry(statusTable, [userId], (userStatus) => ({ ...userStatus, ...omitUndefined(input) }));
