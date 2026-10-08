import { BufferGeometry, Float32BufferAttribute } from "three";

// A flower as two upright cards crossed at right angles, a unit wide and tall, its foot at the origin, so it shows the
// Same from every side and an instance's matrix sizes it
export const createFlowerGeometry = (): BufferGeometry => {
  const flowerGeometry = new BufferGeometry();
  flowerGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(
      [-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0, 0, 0, -0.5, 0, 0, 0.5, 0, 1, 0.5, 0, 1, -0.5],
      3,
    ),
  );
  flowerGeometry.setAttribute("uv", new Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1], 2));
  flowerGeometry.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
  return flowerGeometry;
};
