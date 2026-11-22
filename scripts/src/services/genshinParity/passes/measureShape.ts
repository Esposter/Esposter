import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/shared/ParityPassMeasure";

import { chooseDetailWavelength } from "#src/services/genshinParity/passes/chooseDetailWavelength";
import { compareFamilyTargets } from "#src/services/genshinParity/passes/compareFamilyTargets";
import { computeSurfaceBend } from "#src/services/genshinParity/passes/computeSurfaceBend";
import {
  SHAPE_DEPTH_GATE,
  SHAPE_NORMAL_GATE_DEGREES,
  SHAPE_OUTLINE_GATE_PIXELS,
  SURFACE_WAVELENGTH_FAMILIES,
} from "#src/services/genshinParity/passes/constants";
import { getSurfaceBendReading } from "#src/services/genshinParity/passes/getSurfaceBendReading";
import { measureEnvelope } from "#src/services/genshinParity/passes/measureEnvelope";
import { measureFamilyTargets } from "#src/services/genshinParity/passes/measureFamilyTargets";
import { readFamilyMapWavelength } from "#src/services/genshinParity/passes/readFamilyMapWavelength";
import { readSurfaceWavelengths } from "#src/services/genshinParity/passes/readSurfaceWavelengths";
import { toShapeReading } from "#src/services/genshinParity/passes/toShapeReading";
import { toSurfaceWavelengthDiagnostics } from "#src/services/genshinParity/passes/toSurfaceWavelengthDiagnostics";
import { writeShapeDiff } from "#src/services/genshinParity/passes/writeShapeDiff";
import { WitnessTarget } from "genshin-world/sceneExport";

const TARGET_NAMES: WitnessTarget[] = [
  WitnessTarget.Part,
  WitnessTarget.Depth,
  WitnessTarget.Normal,
  WitnessTarget.GeometryNormal,
];
// How many of a failing family's parts its note names
const NAMED_PART_COUNT = 5;
// The shape pass: each family of ours against the exports' it stands for, target by target (`compareFamilyTargets`).
// Its normal is read on the geometry, the normal before the exports' normal maps, both sides drawn without them, at
// `SHAPE_NORMAL_GATE_DEGREES`. The maps' bend is gated on its own (`getSurfaceBendReading`): ours' bend less the
// Exports', against the floor the exports' two halves stand apart by. The map-included normal stays a diagnostic.
export const measureShape = (component: DerivedAssetComponent, pageRoot?: string): Promise<ParityPassMeasure> =>
  measureFamilyTargets(
    component,
    TARGET_NAMES,
    async (referenceId, exportsRead, oursRead, page, camera) => {
      const toTargets = ({
        targets,
      }: typeof exportsRead): {
        depth: Float32Array;
        geometryNormal: Float32Array;
        normal: Float32Array;
        part: Float32Array;
      } => ({
        depth: targets.depth ?? new Float32Array(),
        geometryNormal: targets.geometryNormal ?? new Float32Array(),
        normal: targets.normal ?? new Float32Array(),
        part: targets.part ?? new Float32Array(),
      });
      const exportsTargets = toTargets(exportsRead);
      const oursTargets = toTargets(oursRead);
      const familyCount = exportsRead.families.length;
      const comparisons = compareFamilyTargets(
        { ...exportsTargets, normal: exportsTargets.geometryNormal },
        { ...oursTargets, normal: oursTargets.geometryNormal },
        exportsRead.width,
        familyCount,
      );
      const mapComparisons = compareFamilyTargets(exportsTargets, oursTargets, exportsRead.width, familyCount);
      const surfaceBends = computeSurfaceBend(exportsTargets, oursTargets, exportsRead.width, familyCount);
      const diffPath = await writeShapeDiff(referenceId, exportsTargets, oursTargets, exportsRead);
      const familyName = (family: number): string => `${referenceId} ${exportsRead.families[family] ?? family}`;
      // A family's normals over their gate, named by the exported parts that carry most of their angle; one with no pixel
      // Both draw has no normals to name a part by, so its no-overlap reading alone reports it
      const partNotes = comparisons
        .filter(({ normal }) => normal !== undefined && normal > SHAPE_NORMAL_GATE_DEGREES)
        .map(({ family, partNormals }) => {
          const total = partNormals.reduce((sum, { angle }) => sum + angle, 0);
          const parts = partNormals
            .toSorted((firstPart, secondPart) => secondPart.angle - firstPart.angle)
            .slice(0, NAMED_PART_COUNT)
            .map(({ angle, part, pixelCount }) => {
              const mesh = exportsRead.parts.find(({ id }) => id === part)?.mesh ?? part;
              return `${mesh} #${part} ${((angle / total) * 100).toFixed(0)}% (${(angle / pixelCount).toFixed(1)} degrees over ${pixelCount} px)`;
            });
          return `${familyName(family)} normal by part: ${parts.join(", ")}`;
        });
      const bendNotes = surfaceBends.map((surfaceBend) => {
        const { gate, value } = getSurfaceBendReading(surfaceBend);
        const [firstHalf, secondHalf] = surfaceBend.halves;
        const owed =
          value > gate
            ? `; owed: procedural normal detail on ${exportsRead.families[surfaceBend.family] ?? surfaceBend.family}'s material, fitted to the exports' bend`
            : "";
        return `${familyName(surfaceBend.family)} surface detail: its exports' normal maps bend its normals ${surfaceBend.exportsAngle.toFixed(1)} degrees (${firstHalf.toFixed(1)} and ${secondHalf.toFixed(1)} over its halves of blocks), ours ${surfaceBend.oursAngle.toFixed(1)} degrees, gated at ${gate.toFixed(1)}${owed}`;
      });
      const mapNotes = mapComparisons
        .filter(({ normal }) => normal !== undefined)
        .map(
          ({ family, normal }) =>
            `${familyName(family)} normal with its normal maps (diagnostic): ${normal?.toFixed(1)} degrees`,
        );
      // The dominant wavelength of each detail family's normal angles, in the exports' frame and in ours, at its median depth
      const wavelengths = exportsRead.families.flatMap((family, index) =>
        SURFACE_WAVELENGTH_FAMILIES.includes(family)
          ? [
              {
                family,
                index,
                ...readSurfaceWavelengths({
                  depth: exportsTargets.depth,
                  exports: exportsTargets,
                  family: index,
                  fovDegrees: camera.fov,
                  height: exportsRead.height,
                  ours: oursTargets,
                  width: exportsRead.width,
                }),
              },
            ]
          : [],
      );
      // The wavelength a family's detail is fitted at: its frame's lobe, and its normal map's where the frame resolves none
      const detailWavelengths = await Promise.all(
        wavelengths.map(async ({ exportsWavelength, family, index }) => ({
          detail: chooseDetailWavelength({
            frame: exportsWavelength,
            texture: exportsWavelength === undefined ? await readFamilyMapWavelength(component, family) : undefined,
          }),
          index,
        })),
      );
      const wavelengthNotes = wavelengths.map(
        ({ index, metresPerPixel }) =>
          `${familyName(index)} surface detail wavelength: a pixel ${metresPerPixel.toFixed(4)} m at the family's depth`,
      );
      const detailNotes = detailWavelengths.map(({ detail, index }) =>
        detail
          ? `${familyName(index)} surface detail wavelength to fit at: ${detail.metres.toFixed(4)} m, ${detail.isFromTexture ? "read from its normal map" : "the frame's lobe"}`
          : `${familyName(index)} surface detail wavelength: none, the frame resolves no lobe and none was read from its normal map`,
      );
      const envelopeReadings = await measureEnvelope(referenceId, exportsRead, oursRead, page, camera);
      return {
        diagnostics: wavelengths.flatMap(({ exportsWavelength, index, oursWavelength }) =>
          toSurfaceWavelengthDiagnostics({ exportsWavelength, family: familyName(index), oursWavelength }),
        ),
        notes: [
          `${referenceId} exports | ours | normals' angle and outlines apart: ${diffPath}`,
          ...partNotes,
          ...bendNotes,
          ...wavelengthNotes,
          ...detailNotes,
          ...mapNotes,
        ],
        readings: [
          ...comparisons.flatMap(({ depth, family, normal, outline }) => {
            const name = familyName(family);
            return [
              { gate: SHAPE_OUTLINE_GATE_PIXELS, name: `${name} outline`, unit: "px", value: outline },
              toShapeReading(`${name} depth`, SHAPE_DEPTH_GATE, "share", depth),
              toShapeReading(`${name} normal`, SHAPE_NORMAL_GATE_DEGREES, "degrees", normal),
            ];
          }),
          ...surfaceBends.map((surfaceBend) => {
            const { gate, value } = getSurfaceBendReading(surfaceBend);
            return toShapeReading(`${familyName(surfaceBend.family)} surface detail bend`, gate, "degrees", value);
          }),
          ...envelopeReadings,
        ],
      };
    },
    pageRoot,
  );
