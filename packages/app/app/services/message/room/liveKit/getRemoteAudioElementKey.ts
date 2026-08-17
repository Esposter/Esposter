import type { Track } from "livekit-client";

import { ID_SEPARATOR } from "@esposter/shared";

// One participant publishes audio from more than one source (microphone, screen share), so the attached
// Elements are keyed by both — attach and detach have to compose the same key or a detach leaks its element
export const getRemoteAudioElementKey = (identity: string, source: Track.Source) =>
  `${identity}${ID_SEPARATOR}${source}`;
