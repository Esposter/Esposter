import type { UpsertStatusInput } from "#shared/models/db/user/UpsertStatusInput";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { statusTable } from "#src/services/message/user/status/constants";

// A status the person sets shows on the row the store holds for them. A person with no row yet has nothing to change, so
// Their first status is drawn when the server answers it
export const getStatusEntry =
  (userId: string, input: UpsertStatusInput): Entry =>
  (view) => {
    const userStatus = view.get(statusTable, [userId]);
    if (userStatus) view.set(statusTable, [userId], { ...userStatus, ...input });
  };
