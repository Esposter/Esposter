<script setup lang="ts">
import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { SightTrailRibbon } from "#src/models/sight/SightTrailRibbon";
import type { GroundPoint } from "genshin-engine";
import type { Scene, Vector3 } from "three";

import { SIGHT_TRAIL_CAPACITY, SIGHT_TRAIL_POINT_CAPACITY } from "#src/services/elementalSight/constants";
import { writeSightTrails } from "#src/services/elementalSight/writeSightTrails";
import { useLoop } from "@tresjs/core";
import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshBasicMaterial } from "three";

interface Props {
  // The sight the screen turns on and off, whose trails are drawn only while it is on, none where no screen holds one
  elementalSight?: ElementalSight;
  // The ends the trails lead to on the ground, the courts of the Seelies still resting
  ends: GroundPoint[];
  // The world's ground at a point in its own coordinates, which each trail is sampled on
  getGroundHeight: (x: number, z: number) => number;
  // The character's position, which every trail starts from, none where no character is drawn
  target?: Vector3;
  // The scene the sight's mask is drawn from, which the trails are added to beside the sight's stand-ins
  sightScene: Scene;
}

const { elementalSight, ends, getGroundHeight, sightScene, target } = defineProps<Props>();
const { onBeforeRender } = useLoop();
const vertexCount = SIGHT_TRAIL_CAPACITY * SIGHT_TRAIL_POINT_CAPACITY * 2;
const ribbon: SightTrailRibbon = {
  colors: new Float32Array(vertexCount * 3),
  indices: new Uint32Array(SIGHT_TRAIL_CAPACITY * (SIGHT_TRAIL_POINT_CAPACITY - 1) * 6),
  positions: new Float32Array(vertexCount * 3),
};
const positionAttribute = new BufferAttribute(ribbon.positions, 3);
const colorAttribute = new BufferAttribute(ribbon.colors, 3);
const indexAttribute = new BufferAttribute(ribbon.indices, 1);
const geometry = new BufferGeometry();
geometry.setAttribute("position", positionAttribute);
geometry.setAttribute("color", colorAttribute);
geometry.setIndex(indexAttribute);
const material = new MeshBasicMaterial({ side: DoubleSide, vertexColors: true });
// The trails are drawn in the sight's scene alone, where the mute leaves them bright. Their points move each frame, so
// The mesh is never culled by the bounds its first frame gave it
const mesh = new Mesh(geometry, material);
mesh.frustumCulled = false;
sightScene.add(mesh);
onBeforeRender(() => {
  const indexCount = writeSightTrails(ribbon, elementalSight, target, ends, getGroundHeight);
  geometry.setDrawRange(0, indexCount);
  if (indexCount === 0) return;
  positionAttribute.needsUpdate = true;
  colorAttribute.needsUpdate = true;
  indexAttribute.needsUpdate = true;
});

onUnmounted(() => {
  sightScene.remove(mesh);
  geometry.dispose();
  material.dispose();
});
</script>
