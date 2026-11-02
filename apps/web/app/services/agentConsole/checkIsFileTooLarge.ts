import { ATTACHMENTS_MAX_BYTE_LENGTH } from "agent-console-server/contracts";

// A file's size is known before it is read, and bounds the attachment it becomes from below at half its size: an image or
// A PDF is base64 of every byte, and text takes at least one JSON byte for each UTF-16 code unit, which is half a UTF-16
// File's size. A file over the ceiling by that much is over it whatever it holds, so it is refused unread, and the
// Precise check stays with fitAttachments after the read
export const checkIsFileTooLarge = (file: File): boolean => file.size / 2 > ATTACHMENTS_MAX_BYTE_LENGTH;
