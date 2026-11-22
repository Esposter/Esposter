import type { RemoteAudioSource } from "#src/models/message/room/realtime/RemoteAudioSource";

import { ID_SEPARATOR } from "@esposter/shared";

export const getRemoteAudioKey = (identity: string, source: RemoteAudioSource) => `${identity}${ID_SEPARATOR}${source}`;
