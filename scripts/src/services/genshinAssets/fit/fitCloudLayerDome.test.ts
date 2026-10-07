import { fitCloudLayerDome } from "#src/services/genshinAssets/fit/fitCloudLayerDome";
import { MathUtils } from "three";
import { describe, expect, test } from "vitest";

describe(fitCloudLayerDome, () => {
  test("reads each ring's profiles and the projections' turn back from a dome drawn with them", () => {
    expect.hasAssertions();

    const center = [0.5, 0.5];
    const turn = -150;
    const wispsTurn = 90;
    // Two rings, the horizon and one 45 degrees up, each four vertices round the axis, the normals tilting inward
    const rings = [
      { elevation: 0, far: 0.5, near: 0.5, normalElevation: 0, wisps: 0 },
      { elevation: 45, far: 0.1, near: 0.2, normalElevation: -30, wisps: 0.6 },
    ];
    const mesh = {
      m_Normals: [] as number[],
      m_UV0: [] as number[],
      m_UV1: [] as number[],
      m_UV2: [] as number[],
      m_Vertices: [] as number[],
    };
    for (const { elevation, far, near, normalElevation, wisps } of rings)
      for (const azimuth of [0, 90, 180, 270]) {
        const [azimuthRadians = 0, elevationRadians = 0, normalRadians = 0] = [azimuth, elevation, normalElevation].map(
          (angle) => MathUtils.degToRad(angle),
        );
        const [x, z] = [Math.cos(azimuthRadians), Math.sin(azimuthRadians)];
        mesh.m_Vertices.push(x, Math.tan(elevationRadians), z);
        mesh.m_Normals.push(-x * Math.cos(normalRadians), Math.sin(normalRadians), -z * Math.cos(normalRadians));
        mesh.m_UV0.push((azimuth + wispsTurn) / 360, wisps);
        const projectedRadians = MathUtils.degToRad(azimuth + turn);
        for (const [values, radius] of [
          [mesh.m_UV1, near],
          [mesh.m_UV2, far],
        ] as const)
          values.push(
            (center[0] ?? 0) + radius * Math.cos(projectedRadians),
            (center[1] ?? 0) + radius * Math.sin(projectedRadians),
          );
      }
    const { dome, residual } = fitCloudLayerDome(mesh);

    expect(dome).toStrictEqual({
      center,
      elevations: [0, 45],
      far: [0.5, 0.1],
      near: [0.5, 0.2],
      normalElevations: [0, -30],
      turn,
      wisps: [0, 0.6],
      wispsTurn,
    });
    expect(residual).toBeCloseTo(0);
  });
});
