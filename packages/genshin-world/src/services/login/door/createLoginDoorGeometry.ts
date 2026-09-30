import { LOGIN_DOOR } from "#src/services/login/door/constants";
import { BoxGeometry, BufferGeometry, ExtrudeGeometry, Path, Shape } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const ARCH_SEGMENTS = 24;
// The door's outline, straight sided under a round head of the given rise, centred on x and standing on zero
const drawDoorOutline = <T extends Path>(outline: T, halfWidth: number, height: number, rise: number): T => {
  const shoulder = height - rise;
  outline.moveTo(-halfWidth, 0).lineTo(halfWidth, 0).lineTo(halfWidth, shoulder);
  outline.absellipse(0, shoulder, halfWidth, rise, 0, Math.PI, false);
  outline.lineTo(-halfWidth, 0);
  return outline;
};
// The door at the flight's end as its two parts, standing on its plinth on zero and facing +z: the stone frame, its
// Outline less the panel's, and the panel recessed within it, which lights when the door opens
export const createLoginDoorGeometry = (): { frame: BufferGeometry; panel: BufferGeometry } => {
  const { archRise, border, depth, height, plinthHeight, recess, width } = LOGIN_DOOR;
  const panelHalfWidth = width / 2 - border;
  const panelHeight = height - border;
  const panelRise = archRise - border / 2;
  const frameOutline = drawDoorOutline(new Shape(), width / 2, height, archRise);
  frameOutline.holes.push(drawDoorOutline(new Path(), panelHalfWidth, panelHeight, panelRise));
  const parts = [
    new ExtrudeGeometry(frameOutline, { bevelEnabled: false, curveSegments: ARCH_SEGMENTS, depth }).translate(
      0,
      plinthHeight,
      -depth / 2,
    ),
    new BoxGeometry(width + border * 2, plinthHeight, depth + border * 2).translate(0, plinthHeight / 2, 0),
  ];
  const nonIndexedParts = parts.map((part) => (part.index ? part.toNonIndexed() : part));
  const frame = mergeGeometries(nonIndexedParts) ?? new BufferGeometry();
  for (const part of new Set([...parts, ...nonIndexedParts])) part.dispose();
  const panel = new ExtrudeGeometry(drawDoorOutline(new Shape(), panelHalfWidth, panelHeight, panelRise), {
    bevelEnabled: false,
    curveSegments: ARCH_SEGMENTS,
    depth: depth - recess,
  }).translate(0, plinthHeight, -depth / 2);
  return { frame, panel };
};
