import type { ParityPassReading } from "#src/models/genshinParity/passes/ParityPassReading";
import type { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";
import type { Page } from "playwright";

import { WitnessTargetName as TargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { compareFamilyEnvelope } from "#src/services/genshinParity/passes/compareFamilyEnvelope";
import { computeEnvelopeRadius } from "#src/services/genshinParity/passes/computeEnvelopeRadius";
import { computeFamilyEnvelope } from "#src/services/genshinParity/passes/computeFamilyEnvelope";
import { readFamilyMask } from "#src/services/genshinParity/passes/readFamilyMask";
import { toShapeReading } from "#src/services/genshinParity/passes/toShapeReading";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { WindrisePartFamily } from "genshin-world";

interface Targets {
  depth: Float32Array;
  normal: Float32Array;
  part: Float32Array;
}
type WitnessTargetsRead = Awaited<ReturnType<typeof readWitnessTargets>>;
const TARGET_NAMES: WitnessTargetName[] = [TargetName.Part, TargetName.Depth, TargetName.Normal];
const toTargets = ({ targets }: WitnessTargetsRead): Targets => ({
  depth: targets.depth ?? new Float32Array(),
  normal: targets.normal ?? new Float32Array(),
  part: targets.part ?? new Float32Array(),
});
// The Oak's shape read on its envelope, a family of scattered cards: the exports' and ours at the reference's camera
// Each closed at the cards' spacing (`computeEnvelopeRadius`), against a gate read off the exports themselves. The
// Exports' cards are split in two halves (each card whole in one of them, `WitnessView.leafHalf`), and the gate is how
// Far those two halves stand apart on their envelopes, so ours passes once it stands no further from the exports than
// The exports' own halves stand from each other. The per-card readings stay with the pass as diagnostics
export const measureEnvelope = async (
  referenceId: string,
  exportsRead: WitnessTargetsRead,
  oursRead: WitnessTargetsRead,
  page: Page,
  camera: NonNullable<WitnessView["camera"]>,
): Promise<ParityPassReading[]> => {
  const family = exportsRead.families.indexOf(WindrisePartFamily.Oak);
  if (family === -1) return [];
  const { height, width } = exportsRead;
  const exportsTargets = toTargets(exportsRead);
  const halves: Targets[] = [];
  for (const leafHalf of [0, 1] as const) {
    // oxlint-disable-next-line no-await-in-loop -- one half is drawn after the other on one page
    await setPageWitnessView(page, { camera, isAlone: true, leafHalf });
    // oxlint-disable-next-line no-await-in-loop -- one half is read after the other on one page
    halves.push(toTargets(await readWitnessTargets(page, TARGET_NAMES)));
  }
  const [firstHalf, secondHalf] = halves;
  if (!firstHalf || !secondHalf)
    throw new InvalidOperationError(Operation.Read, referenceId, "has no halves of its cards");
  const maskOf = ({ part }: Targets) => readFamilyMask(part, family, width * height);
  const radius = computeEnvelopeRadius(maskOf(exportsTargets), [maskOf(firstHalf), maskOf(secondHalf)], width, height);
  const envelopeOf = (targets: Targets) => computeFamilyEnvelope(targets, family, width, height, radius);
  const floor = compareFamilyEnvelope(envelopeOf(firstHalf), envelopeOf(secondHalf), width, height);
  const ours = compareFamilyEnvelope(envelopeOf(exportsTargets), envelopeOf(toTargets(oursRead)), width, height);
  if (floor.depth === undefined || floor.normal === undefined)
    throw new InvalidOperationError(Operation.Read, referenceId, "has halves of its cards with no pixel in common");
  const name = `${referenceId} ${WindrisePartFamily.Oak} envelope`;
  return [
    { gate: floor.outline, name: `${name} outline`, unit: "px", value: ours.outline },
    toShapeReading(`${name} depth`, floor.depth, "share", ours.depth),
    toShapeReading(`${name} normal`, floor.normal, "degrees", ours.normal),
  ];
};
