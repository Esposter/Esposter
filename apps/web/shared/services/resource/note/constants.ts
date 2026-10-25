import { MimeType } from "#shared/models/file/MimeType";

// The images a note takes, shared by the picker's accept list and the paste and drop handler, so one list decides both
export const NOTE_IMAGE_MIME_TYPES: string[] = [MimeType.Gif, MimeType.Jpeg, MimeType.Png, MimeType.Webp];
