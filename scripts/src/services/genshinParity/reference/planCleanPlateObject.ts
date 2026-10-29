import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ParityReferenceManifestCleanPlate } from "#src/models/genshinParity/reference/ParityReferenceManifestCleanPlate";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";

import { fillCleanPlate } from "#src/services/genshinParity/reference/fillCleanPlate";
import { getCleanPlateDigest } from "#src/services/genshinParity/reference/getCleanPlateDigest";
import { getCleanPlateRegions } from "#src/services/genshinParity/reference/getCleanPlateRegions";
import { packReferenceImage } from "#src/services/genshinParity/reference/packReferenceImage";
import { sha256Buffer } from "#src/services/genshinParity/reference/sha256Buffer";
import sharp from "sharp";

// A backdrop's clean plate from the screenshot it is filled from: the plate when the entry names one, else the reference.
// Its digest is the input's hash and its regions, so a stored plate that still matches is held without filling it again.
// Undefined when the entry draws none. `stored` is set only for a plate filled now
export const planCleanPlateObject = async (
  reference: ParityReference,
  input: ReferenceEntryImage,
  dimensions: { height: number; width: number },
  existing: ParityReferenceManifestCleanPlate | undefined,
): Promise<{ cleanPlate: ParityReferenceManifestCleanPlate; stored?: Buffer } | undefined> => {
  const regions = getCleanPlateRegions(reference, dimensions);
  if (regions === undefined) return undefined;
  const digest = getCleanPlateDigest(input.image.sha256, regions);
  if (existing?.digest === digest) return { cleanPlate: existing };
  const pixels = await fillCleanPlate(await input.read(), regions, dimensions);
  const { data, info } = await packReferenceImage(
    sharp(pixels, { raw: { channels: 4, height: dimensions.height, width: dimensions.width } }),
  );
  return {
    cleanPlate: { bytes: data.length, digest, height: info.height, sha256: sha256Buffer(data), width: info.width },
    stored: data,
  };
};
