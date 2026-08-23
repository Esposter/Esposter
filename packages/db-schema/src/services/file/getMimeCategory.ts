import { MimeCategory } from "#src/models/file/MimeCategory";

// Maps a raw mimetype to its coarse category — image/video/audio by prefix, everything else a document.
export const getMimeCategory = (mimetype: string): MimeCategory => {
  switch (mimetype.slice(0, mimetype.indexOf("/"))) {
    case "audio":
      return MimeCategory.Audio;
    case "image":
      return MimeCategory.Image;
    case "video":
      return MimeCategory.Video;
    default:
      return MimeCategory.Document;
  }
};
