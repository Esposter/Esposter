import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { CustomTableClient } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { AzureTable } from "@esposter/db-schema";
// The MessagesMetadata table holds every metadata type, so every emoji read narrows it to the emoji rows
export const useMessageEmojiMetadataClient = async () =>
  (await useTableClient(AzureTable.MessagesMetadata)) as CustomTableClient<MessageEmojiMetadataEntity>;
