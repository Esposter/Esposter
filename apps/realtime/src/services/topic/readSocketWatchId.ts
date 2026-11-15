import { z } from "zod";

const socketAttachmentSchema = z.object({ watchId: z.uuidv7() });

// The id a tab's watches are keyed by, which its socket carries in its attachment from the first watch it sent. A socket
// That never watched holds no attachment, so it has no id and no watches
export const readSocketWatchId = (socket: WebSocket): string | undefined => {
  const attachment = socketAttachmentSchema.safeParse(socket.deserializeAttachment());
  return attachment.success ? attachment.data.watchId : undefined;
};
