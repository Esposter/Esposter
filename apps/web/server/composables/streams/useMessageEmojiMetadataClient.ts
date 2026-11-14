import type { MessageEmojiMetadataEntity } from "@esposter/db-schema";
import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { StreamTable } from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";

// The MessagesMetadata table holds every metadata type, so every emoji read narrows it to the emoji rows
export const useMessageEmojiMetadataClient = () =>
  useStreamTableClient(StreamTable.MessagesMetadata) as StreamTableClient<MessageEmojiMetadataEntity>;
