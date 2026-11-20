import type { CallBackground } from "#shared/models/message/call/CallBackground";

import { CALL_BACKGROUND_KEY } from "#src/services/message/room/call/constants";
import { ID_SEPARATOR } from "@esposter/shared";

export const getCallBackgroundKey = (slot: CallBackground["slot"]) => `${CALL_BACKGROUND_KEY}${ID_SEPARATOR}${slot}`;
