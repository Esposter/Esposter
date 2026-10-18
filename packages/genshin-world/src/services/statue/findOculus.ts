import { OCULUS_ADVENTURE_EXP } from "#src/services/statue/constants";

// Touching an Oculus collects it once: its id joins the found ids and it joins its region's collected count, which the
// Region's Worship Statue offers later. A touch on an Oculus already found gives nothing, not even its Adventure EXP
export const findOculus = (
  foundOculusIds: ReadonlySet<string>,
  oculusId: string,
  collectedCount: number,
): { adventureExp: number; collectedCount: number; foundOculusIds: ReadonlySet<string> } =>
  foundOculusIds.has(oculusId)
    ? { adventureExp: 0, collectedCount, foundOculusIds }
    : {
        adventureExp: OCULUS_ADVENTURE_EXP,
        collectedCount: collectedCount + 1,
        foundOculusIds: new Set([...foundOculusIds, oculusId]),
      };
