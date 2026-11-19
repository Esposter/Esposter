import { MimeType } from "#shared/models/file/MimeType";

// The images a user puts into the app. Every picker that takes an image and every server check on an image upload
// Reads this one list, so the two cannot disagree. SVG is not among them: an SVG served from the public assets host can
// Carry script. HEIC and BMP are not either, since browsers do not render them
export const IMAGE_UPLOAD_MIME_TYPES: string[] = [
  MimeType.Avif,
  MimeType.Gif,
  MimeType.Jpeg,
  MimeType.Png,
  MimeType.Webp,
];
