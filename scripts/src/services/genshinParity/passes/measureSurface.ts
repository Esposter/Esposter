import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { compareFamilyAlbedo } from "#src/services/genshinParity/passes/compareFamilyAlbedo";
import { SHAPE_OUTLINE_GATE_PIXELS, SURFACE_COLOUR_GATE } from "#src/services/genshinParity/passes/constants";
import { measureFamilyTargets } from "#src/services/genshinParity/passes/measureFamilyTargets";
import { writeSurfaceDiff } from "#src/services/genshinParity/passes/writeSurfaceDiff";

const TARGET_NAMES = [WitnessTargetName.Part, WitnessTargetName.Albedo];
// A target of four floats a pixel moved across by whole pixels, its first columns repeating the edge
const shiftAcross = (values: Float32Array, width: number, pixels: number): Float32Array =>
  Float32Array.from(values, (_value, index) => {
    const pixel = Math.floor(index / 4);
    const column = pixel % width;
    return values[(pixel - Math.min(column, pixels)) * 4 + (index % 4)] ?? 0;
  });
// The surface pass: each family's unlit colour of ours against the exports' it stands for, where both draw it
// (`compareFamilyAlbedo`): the distance between their mean colours, gated where two colours side by side are just told
// Apart, and how unlike their lightness is in structure, gated at what the exports' own albedo reads against itself
// Moved across by the shape's outline gate, as far as a shape the shape pass holds may stand off its place. A family
// Too thin to meet its moved self reads no structure there, so its gate is none rather than Infinity, which holds any
export const measureSurface = (component: DerivedAssetComponent): Promise<ParityPassMeasure> =>
  measureFamilyTargets(component, TARGET_NAMES, async (referenceId, exportsRead, oursRead) => {
    const { families, width } = exportsRead;
    const exportsTargets = {
      albedo: exportsRead.targets.albedo ?? new Float32Array(),
      part: exportsRead.targets.part ?? new Float32Array(),
    };
    const oursTargets = {
      albedo: oursRead.targets.albedo ?? new Float32Array(),
      part: oursRead.targets.part ?? new Float32Array(),
    };
    const shiftedTargets = {
      albedo: shiftAcross(exportsTargets.albedo, width, SHAPE_OUTLINE_GATE_PIXELS),
      part: shiftAcross(exportsTargets.part, width, SHAPE_OUTLINE_GATE_PIXELS),
    };
    const familyStructureGateMap = new Map(
      compareFamilyAlbedo(exportsTargets, shiftedTargets, width, families.length).map(({ family, structure }) => [
        family,
        Number.isFinite(structure) ? structure : 0,
      ]),
    );
    const diffPath = await writeSurfaceDiff(referenceId, exportsTargets, oursTargets, exportsRead);
    return {
      notes: [`${referenceId} exports | ours | lightness apart: ${diffPath}`],
      readings: compareFamilyAlbedo(exportsTargets, oursTargets, width, families.length).flatMap(
        ({ colour, family, structure }) => {
          const name = `${referenceId} ${families[family] ?? family}`;
          return [
            { gate: SURFACE_COLOUR_GATE, name: `${name} colour`, unit: "ΔE", value: colour },
            {
              gate: familyStructureGateMap.get(family) ?? 0,
              name: `${name} structure`,
              unit: "share",
              value: structure,
            },
          ];
        },
      ),
    };
  });
