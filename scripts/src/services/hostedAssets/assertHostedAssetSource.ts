import { HOSTED_OBJECT_MAX_BYTES, UNCOMPRESSED_AUDIO_EXTENSIONS } from "#src/services/hostedAssets/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { HOSTED_ASSET_CONTENT_TYPES } from "hosted-assets";
import { extname } from "node:path";

// Refuses a source file the placement rules keep out of a product's objects, naming the file, before any object is written.
// An extension no content type names has no object to serve as a hosted file, so the file is refused rather than served
// Under a guessed type
export const assertHostedAssetSource = ({ bytes, path }: { bytes: number; path: string }): void => {
  const extension = extname(path);
  if (UNCOMPRESSED_AUDIO_EXTENSIONS.has(extension))
    throw new InvalidOperationError(
      Operation.Read,
      path,
      "is lossless or uncompressed audio, which is published as MP3 instead",
    );
  if (bytes > HOSTED_OBJECT_MAX_BYTES)
    throw new InvalidOperationError(Operation.Read, path, `is over the ${HOSTED_OBJECT_MAX_BYTES} byte cap`);
  if (!Object.hasOwn(HOSTED_ASSET_CONTENT_TYPES, extension))
    throw new InvalidOperationError(Operation.Read, path, "has an extension with no content type");
};
