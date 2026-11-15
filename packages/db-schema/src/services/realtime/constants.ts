import { MAX_READ_LIMIT } from "@esposter/shared";

// The most topics one watch or unwatch frame names, so one frame cannot fan its socket out to an unbounded number of
// Topic objects. A tab with more sends them over several frames
export const MAX_FRAME_TOPICS = MAX_READ_LIMIT;
// The longest id a topic names: a UUID, an integer or a short key, with room to spare and no more
export const TOPIC_ID_MAX_LENGTH = 256;
