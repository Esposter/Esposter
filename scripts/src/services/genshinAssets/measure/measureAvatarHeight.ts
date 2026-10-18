import type { AvatarMesh } from "genshin-world/sceneExport";

import { measureVerticalExtent } from "#src/services/genshinAssets/measure/measureVerticalExtent";

// The game's model's height in metres, from its meshes' positions in the rig's rest pose, which Unity keeps in metres.
// Each mesh's positions are copied out of the binary at their view, so the read never depends on the binary's
// Alignment, and the height runs from the lowest of them to the highest across every mesh
export const measureAvatarHeight = ({ meshes }: { meshes: Pick<AvatarMesh, "positions">[] }, binary: Buffer): number =>
  measureVerticalExtent(
    meshes.map(({ positions }) => {
      const end = positions.offset + positions.length * Float32Array.BYTES_PER_ELEMENT;
      return new Float32Array(Uint8Array.from(binary.subarray(positions.offset, end)).buffer);
    }),
  );
