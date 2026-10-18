import { followLoginWitnessDoor } from "#src/services/login/door/followLoginWitnessDoor";
import { rideLoginWitnessDoor } from "#src/services/login/door/rideLoginWitnessDoor";
import { takeOne } from "@esposter/shared";
import { Group, Matrix4, Quaternion, Vector3 } from "three";
import { describe, expect, test } from "vitest";

// Our door turned to face the walkway, and the game's family with its one part placed where it stands in its own axes
// And centimetres, the family itself carrying no offset until a test sets one
const createDoor = () => {
  const doorRest = new Matrix4().makeRotationY(Math.PI).setPosition(2, 1, -40);
  const door = new Group();
  door.applyMatrix4(doorRest);
  const doorPieces = [new Group(), new Group()];
  door.add(...doorPieces);
  const family = new Group();
  const part = new Group();
  part.applyMatrix4(
    new Matrix4().compose(new Vector3(2, 1, -40), new Quaternion(0, 1, 0, 0), new Vector3(0.01, 0.01, 0.01)),
  );
  const piece = new Group();
  piece.name = "1";
  part.add(piece);
  family.add(part);
  return { door, doorPieces, doorRest, family, part };
};
const round = (values: number[]): number[] => values.map((value) => Math.round(value * 1e9) / 1e9 + 0);
const toRounded = (matrix: Matrix4): number[] => round(matrix.toArray());

describe("rideLoginWitnessDoor", () => {
  test("rides a copy of each piece into the door piece its name gives", () => {
    expect.hasAssertions();

    const { doorPieces, family } = createDoor();
    const copy = takeOne(rideLoginWitnessDoor(family, doorPieces));

    expect(copy.parent).toBe(takeOne(doorPieces.slice(1)));
  });

  test("carries a piece along the lift of the piece of ours its bone names", () => {
    expect.hasAssertions();

    const { door, doorPieces, family } = createDoor();
    const copy = takeOne(rideLoginWitnessDoor(family, doorPieces));
    door.updateMatrixWorld(true);
    const rest = copy.getWorldPosition(new Vector3());
    takeOne(doorPieces.slice(1)).position.set(0, -6, 0);
    door.updateMatrixWorld(true);

    expect(round(copy.getWorldPosition(new Vector3()).sub(rest).toArray())).toStrictEqual([0, -6, 0]);
  });
});

describe("followLoginWitnessDoor", () => {
  test("stands a piece where its part's placement does while its family has no offset", () => {
    expect.hasAssertions();

    const { door, doorPieces, doorRest, family, part } = createDoor();
    const copy = takeOne(rideLoginWitnessDoor(family, doorPieces));
    followLoginWitnessDoor(family, doorPieces, doorRest);
    door.updateMatrixWorld(true);
    part.updateMatrixWorld(true);

    expect(toRounded(copy.matrixWorld)).toStrictEqual(toRounded(part.matrixWorld));
  });

  test("stands a piece at its family's offset, read in our door's axes", () => {
    expect.hasAssertions();

    const { door, doorPieces, doorRest, family, part } = createDoor();
    const copy = takeOne(rideLoginWitnessDoor(family, doorPieces));
    family.position.set(0.5, 0.25, 0);
    followLoginWitnessDoor(family, doorPieces, doorRest);
    door.updateMatrixWorld(true);

    expect(toRounded(copy.matrixWorld)).toStrictEqual(
      toRounded(new Matrix4().makeTranslation(0.5, 0.25, 0).multiply(part.matrix)),
    );
  });

  test("follows the family's offset each frame it is set to", () => {
    expect.hasAssertions();

    const { door, doorPieces, doorRest, family, part } = createDoor();
    const copy = takeOne(rideLoginWitnessDoor(family, doorPieces));
    family.position.set(0.5, 0.25, 0);
    followLoginWitnessDoor(family, doorPieces, doorRest);
    family.position.set(0, 2, 0);
    followLoginWitnessDoor(family, doorPieces, doorRest);
    door.updateMatrixWorld(true);

    expect(toRounded(copy.matrixWorld)).toStrictEqual(
      toRounded(new Matrix4().makeTranslation(0, 2, 0).multiply(part.matrix)),
    );
  });
});
