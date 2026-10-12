import { rideLoginWitnessDoor } from "#src/services/login/door/rideLoginWitnessDoor";
import { takeOne } from "@esposter/shared";
import { Group, Matrix4, Quaternion, Vector3 } from "three";
import { describe, expect, test } from "vitest";

// Our door turned to face the walkway, and the game's placed where it stands in its own axes and centimetres
const createDoor = () => {
  const doorRest = new Matrix4().makeRotationY(Math.PI).setPosition(2, 1, -40);
  const door = new Group();
  door.applyMatrix4(doorRest);
  const doorPieces = [new Group(), new Group()];
  door.add(...doorPieces);
  const part = new Group();
  part.applyMatrix4(
    new Matrix4().compose(new Vector3(2, 1, -40), new Quaternion(0, 1, 0, 0), new Vector3(0.01, 0.01, 0.01)),
  );
  const piece = new Group();
  piece.name = "1";
  part.add(piece);
  return { door, doorPieces, doorRest, part };
};
const round = (values: number[]): number[] => values.map((value) => Math.round(value * 1e9) / 1e9 + 0);
const toRounded = (matrix: Matrix4): number[] => round(matrix.toArray());

describe("rideLoginWitnessDoor", () => {
  test("stands a piece where its part's placement does while our door is at rest", () => {
    expect.hasAssertions();

    const { door, doorPieces, doorRest, part } = createDoor();
    const copy = takeOne(rideLoginWitnessDoor(part, doorPieces, doorRest));
    door.updateMatrixWorld(true);
    part.updateMatrixWorld(true);

    expect(copy.parent).toBe(takeOne(doorPieces.slice(1)));
    expect(toRounded(copy.matrixWorld)).toStrictEqual(toRounded(part.matrixWorld));
  });

  test("carries a piece along the lift of the piece of ours its bone names", () => {
    expect.hasAssertions();

    const { door, doorPieces, doorRest, part } = createDoor();
    const copy = takeOne(rideLoginWitnessDoor(part, doorPieces, doorRest));
    door.updateMatrixWorld(true);
    const rest = copy.getWorldPosition(new Vector3());
    takeOne(doorPieces.slice(1)).position.set(0, -6, 0);
    door.updateMatrixWorld(true);

    expect(round(copy.getWorldPosition(new Vector3()).sub(rest).toArray())).toStrictEqual([0, -6, 0]);
  });
});
