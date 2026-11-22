import type { MessageEvents } from "#shared/models/message/events/MessageEvents";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { checkIsNewerThanCopy } from "#src/services/message/checkIsNewerThanCopy";
import { omitUndefined } from "@esposter/shared";

// Writes an update over one held copy of a message. Every store that holds a copy writes it through here, so each copy
// Takes the change only when the change is newer than that copy
export const updateMessageCopy = (copy: undefined | Versioned, input: MessageEvents["updateMessage"][0][0]) => {
  if (copy && checkIsNewerThanCopy(copy, input)) Object.assign(copy, omitUndefined(input));
};
