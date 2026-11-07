import type { PropShape } from "#src/models/genshinAssets/props/PropShape";

// A prop kind as its fit takes it: the name its record is keyed by (`props/<name>`), the mesh its prefab exports under the
// props' assets, and how its outline is fitted. A round kind names the bands and tolerance its lathe is read with
export type PropKind =
  | { bandHeight: number; mesh: string; name: string; shape: PropShape.Lathe; tolerance: number }
  | { mesh: string; name: string; shape: PropShape.Hull };
