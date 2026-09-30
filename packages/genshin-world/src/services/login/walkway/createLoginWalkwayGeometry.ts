import { LOGIN_DAIS, LOGIN_DOOR_Z } from "#src/services/login/door/constants";
import {
  LOGIN_FIRST_WING_CENTRE,
  LOGIN_PLATFORM,
  LOGIN_SEGMENT_LENGTH,
  LOGIN_WALKWAY_DEPTH,
  LOGIN_WALKWAY_START,
  LOGIN_WALKWAY_WIDTH,
  LOGIN_WING,
} from "#src/services/login/walkway/constants";
import { BoxGeometry, BufferGeometry, ExtrudeGeometry, Shape } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// A slab whose plan is a rectangle with its corners cut, its top at zero and centred on the walkway's line at `z`
const createChamferedSlab = (halfWidth: number, halfLength: number, chamfer: number, z: number): BufferGeometry => {
  const plan = new Shape()
    .moveTo(-halfWidth + chamfer, -halfLength)
    .lineTo(halfWidth - chamfer, -halfLength)
    .lineTo(halfWidth, -halfLength + chamfer)
    .lineTo(halfWidth, halfLength - chamfer)
    .lineTo(halfWidth - chamfer, halfLength)
    .lineTo(-halfWidth + chamfer, halfLength)
    .lineTo(-halfWidth, halfLength - chamfer)
    .lineTo(-halfWidth, -halfLength + chamfer)
    .closePath();
  // The plan is drawn on x and -z and extruded up through the slab's thickness
  return new ExtrudeGeometry(plan, { bevelEnabled: false, depth: LOGIN_WALKWAY_DEPTH })
    .rotateX(-Math.PI / 2)
    .translate(0, -LOGIN_WALKWAY_DEPTH, z);
};
// The walkway as one geometry, its surface at zero: the slab from behind the camera to the door's dais, a pair of
// Wings across it and a raised platform a little on at every segment short of the dais, and the dais the door stands on
export const createLoginWalkwayGeometry = (): BufferGeometry => {
  const daisFront = LOGIN_DOOR_Z + LOGIN_DAIS.length / 2;
  const length = LOGIN_WALKWAY_START - daisFront;
  const parts: BufferGeometry[] = [
    new BoxGeometry(LOGIN_WALKWAY_WIDTH, LOGIN_WALKWAY_DEPTH, length).translate(
      0,
      -LOGIN_WALKWAY_DEPTH / 2,
      LOGIN_WALKWAY_START - length / 2,
    ),
    new BoxGeometry(LOGIN_DAIS.width, LOGIN_DAIS.height + LOGIN_WALKWAY_DEPTH, LOGIN_DAIS.length).translate(
      0,
      (LOGIN_DAIS.height - LOGIN_WALKWAY_DEPTH) / 2,
      LOGIN_DOOR_Z,
    ),
  ];
  for (let wingZ = LOGIN_FIRST_WING_CENTRE; wingZ - LOGIN_SEGMENT_LENGTH / 2 > daisFront; wingZ -= LOGIN_SEGMENT_LENGTH)
    parts.push(
      createChamferedSlab(
        LOGIN_WALKWAY_WIDTH / 2 + LOGIN_WING.overhang,
        LOGIN_WING.length / 2,
        LOGIN_WING.chamfer,
        wingZ,
      ),
      new BoxGeometry(LOGIN_PLATFORM.width, LOGIN_PLATFORM.height, LOGIN_PLATFORM.length).translate(
        0,
        LOGIN_PLATFORM.height / 2,
        wingZ + LOGIN_PLATFORM.offset,
      ),
    );

  const nonIndexedParts = parts.map((part) => (part.index ? part.toNonIndexed() : part));
  const walkwayGeometry = mergeGeometries(nonIndexedParts) ?? new BufferGeometry();
  for (const part of new Set([...parts, ...nonIndexedParts])) part.dispose();
  return walkwayGeometry;
};
