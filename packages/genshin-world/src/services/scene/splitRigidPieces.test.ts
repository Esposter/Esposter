import { readObjFaceVertices } from "#src/services/scene/readObjFaceVertices";
import { splitRigidPieces } from "#src/services/scene/splitRigidPieces";
import { takeOne } from "@esposter/shared";
import { Mesh } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { describe, expect, test } from "vitest";

describe("splitRigidPieces", () => {
  // Two triangles on vertices the first bone carries and one on the second's, the second written first in its group
  const OBJ = [
    "g Door",
    "v 0 0 0",
    "v 1 0 0",
    "v 0 1 0",
    "v 5 0 0",
    "v 6 0 0",
    "v 5 1 0",
    "g Door_0",
    "f 4 5 6",
    "f 1 2 3",
    "f 3 2 1",
  ].join("\n");
  const VERTEX_PIECES = [0, 0, 0, 1, 1, 1];

  test("splits each triangle onto the bone its face's vertices follow, its corners in its face's order", () => {
    expect.hasAssertions();

    const submesh = takeOne(new OBJLoader().parse(OBJ).children.filter((child) => child instanceof Mesh));
    const pieceGeometryMap = splitRigidPieces(submesh, readObjFaceVertices(OBJ).get(submesh.name) ?? [], VERTEX_PIECES);

    expect(
      Object.fromEntries(
        Array.from(pieceGeometryMap, ([piece, geometry]) => [piece, [...geometry.getAttribute("position").array]]),
      ),
    ).toStrictEqual({ 0: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0], 1: [5, 0, 0, 6, 0, 0, 5, 1, 0] });
  });

  test("refuses a submesh whose triangles are not its group's faces", () => {
    expect.hasAssertions();

    const submesh = takeOne(new OBJLoader().parse(OBJ).children.filter((child) => child instanceof Mesh));

    expect(() => splitRigidPieces(submesh, [0], VERTEX_PIECES)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Door_0, has 3 triangles and 1 faces in its group]`,
    );
  });
});
