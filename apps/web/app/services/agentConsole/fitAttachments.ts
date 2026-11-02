import type { Attachment } from "agent-console-server/contracts";

import { getAttachmentByteLength } from "@/services/agentConsole/getAttachmentByteLength";
import { ATTACHMENTS_MAX_BYTE_LENGTH } from "agent-console-server/contracts";

// The new attachments a prompt can take beside the ones it holds, in the order they were picked, and the ones that would
// take it over the ceiling its attachments share
export const fitAttachments = (attachments: Attachment[], newAttachments: Attachment[]) => {
  let byteLength = attachments.reduce((total, attachment) => total + getAttachmentByteLength(attachment), 0);
  const fitted: Attachment[] = [];
  const refused: Attachment[] = [];
  for (const attachment of newAttachments) {
    const attachmentByteLength = getAttachmentByteLength(attachment);
    if (byteLength + attachmentByteLength > ATTACHMENTS_MAX_BYTE_LENGTH) refused.push(attachment);
    else {
      fitted.push(attachment);
      byteLength += attachmentByteLength;
    }
  }
  return { fitted, refused };
};
