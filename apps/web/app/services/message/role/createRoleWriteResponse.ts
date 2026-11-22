import type { Arrival } from "#src/models/shared/overlay/Arrival";
import type { WriteResponse } from "#src/models/shared/overlay/WriteResponse";

import { roleTables } from "#src/services/message/role/constants";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { createHeaderConfirmations } from "#src/services/shared/overlay/createHeaderConfirmations";

// A role write's answer for the overlay: the rows the answer names, and the headers that confirm the entry at the
// Versions its calls answered with. The call starts before any await, so every call the write makes is collected
export const createRoleWriteResponse = async <TResult>(
  call: () => Promise<TResult>,
  toArrivals: (result: TResult) => Arrival[],
): Promise<WriteResponse> => {
  const { result, rowVersions } = await collectRowVersions(call);
  return { arrivals: toArrivals(result), confirmed: createHeaderConfirmations(roleTables, rowVersions) };
};
