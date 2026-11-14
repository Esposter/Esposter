import type { StandardMessageEntity, UpdateMessageInput } from "@esposter/db-schema";
import type { SetOptional } from "type-fest";

// The payload of a message update the client applies to its own list
export interface MessageEvents {
  updateMessage: [
    [
      SetOptional<
        Pick<StandardMessageEntity, "files" | "isEdited" | "isPinned" | "linkPreviewResponse"> & UpdateMessageInput,
        "files" | "linkPreviewResponse" | "message"
      >,
    ],
  ];
}
