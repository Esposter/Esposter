import { replaceReferenceCameraPose } from "#src/services/genshinParity/witness/replaceReferenceCameraPose";
import { describe, expect, test } from "vitest";

describe(replaceReferenceCameraPose, () => {
  const source = `export const ParityReferenceMap = {
  "a": {
    props: { cameraPose: { fov: 0, heading: 0, pitch: 0, position: [0, 0, 0] } },
  },
  // A comment between two references
  "b": {
    props: { cameraPose: { fov: 0, heading: 0, pitch: 0, position: [0, 0, 0] }, heldMinutes: 0 },
  },
  "c": { props: {} },
};
`;

  test("sets the reference's own held camera, rounded as pose prints it, and no other's", () => {
    expect.hasAssertions();

    expect(replaceReferenceCameraPose(source, "b", [1, 2, 3, 4, 5, 6.0004])).toBe(
      source.replace(
        "{ cameraPose: { fov: 0, heading: 0, pitch: 0, position: [0, 0, 0] }, heldMinutes: 0 }",
        "{ cameraPose: { fov: 6, heading: 4, pitch: 5, position: [1, 2, 3] }, heldMinutes: 0 }",
      ),
    );
  });

  test("throws for a reference that holds no camera", () => {
    expect.hasAssertions();

    expect(() => replaceReferenceCameraPose(source, "c", [])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: c, holds no camera in its props to write]`,
    );
  });
});
