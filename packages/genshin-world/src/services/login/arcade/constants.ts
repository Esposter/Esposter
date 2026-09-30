// The arcades running through the cloud sea, their feet on the floor and their railings a little over the walkway: a
// Pair either side of the walkway, as the references show them from the title's pose, more down the flight, and one
// Across the far side of the door. Each runs from its start along its heading, in radians from +x
export const LOGIN_ARCADE = { bayWidth: 4.5, depth: 1.2, height: 42, pierWidth: 1.1, spandrelHeight: 1.6 };
export const LOGIN_ARCADE_BALUSTRADE = { height: 1.1, postSpacing: 1.4, thickness: 0.22 };
export const LOGIN_ARCADES: readonly { bayCount: number; heading: number; start: [number, number] }[] = [
  { bayCount: 14, heading: -Math.PI / 2, start: [-26, -40] },
  { bayCount: 9, heading: -Math.PI / 2, start: [24, -34] },
  { bayCount: 12, heading: -Math.PI / 2, start: [-32, -120] },
  { bayCount: 12, heading: -Math.PI / 2, start: [30, -110] },
  { bayCount: 26, heading: 0, start: [-60, -200] },
];
