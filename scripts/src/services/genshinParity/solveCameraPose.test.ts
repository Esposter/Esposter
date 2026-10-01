import { projectWitnessPoint } from "#src/services/genshinParity/projectWitnessPoint";
import { solveCameraPose } from "#src/services/genshinParity/solveCameraPose";
import { describe, expect, test } from "vitest";

describe(solveCameraPose, () => {
  // A pose off every axis, and points spread through the depth in front of it
  const pose = [1, 2, 10, 10, -5, 50];
  const points: [number, number, number][] = [
    [0, 0, 0],
    [2, 0, -1],
    [0, 3, -2],
    [-2, 1, 1],
    [1, -1, -4],
    [-1, 2, -3],
    [3, 2, 0],
  ];
  const correspondences = points.map((point) => ({ pixel: projectWitnessPoint(pose, point, 480, 270).pixel, point }));

  test("recovers a pose in closed form from six or more points, to a reprojection error of nothing", () => {
    expect.hasAssertions();

    const solved = solveCameraPose(correspondences, 480, 270);

    expect(solved.rms).toBeLessThan(1e-3);
    for (const [index, value] of pose.entries()) expect(solved.pose[index]).toBeCloseTo(value, 2);
  });

  test("refines a pose from a start given for fewer points", () => {
    expect.hasAssertions();

    const solved = solveCameraPose(correspondences.slice(0, 4), 480, 270, [0, 0, 12, 0, 0, 45]);

    expect(solved.rms).toBeLessThan(1e-3);
  });

  test("prices an edge's distance across alone, wherever along its silhouette it was read", () => {
    expect.hasAssertions();

    // Each point read as an edge a long way down its silhouette, so only its distance across is right
    const edges = correspondences.map(({ pixel: [u, v], point }) => ({
      isEdge: true,
      pixel: [u, v + 40] as const,
      point,
    }));
    const solved = solveCameraPose([...correspondences.slice(0, 4), ...edges.slice(4)], 480, 270, pose);

    expect(solved.rms).toBeLessThan(1e-3);
  });
});
