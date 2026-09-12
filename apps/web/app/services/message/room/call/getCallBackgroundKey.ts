import type { CallBackground } from "#shared/models/message/call/CallBackground";

import { ID_SEPARATOR } from "@esposter/shared";

export const getCallBackgroundKey = (slot: CallBackground["slot"]) => `callBackground${ID_SEPARATOR}${slot}`;
