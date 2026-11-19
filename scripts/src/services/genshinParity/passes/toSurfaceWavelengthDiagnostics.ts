import type { ParityPassDiagnostic } from "#src/models/genshinParity/shared/ParityPassDiagnostic";

import { NO_DETAIL_LOBE_REASON } from "#src/services/genshinParity/passes/constants";

// A surface wavelength in metres, or the reason none resolved, as a diagnostic: the wavelength is the exports' frame's
// Lobe and ours, and it holds no gate, since our render's detail has no lobe the measure can read at the reference's
// Resolution. The family's surface detail bend is what gates it
const toWavelengthDiagnostic = (name: string, metres: number | undefined): ParityPassDiagnostic =>
  metres === undefined ? { name, reason: NO_DETAIL_LOBE_REASON, unit: "m" } : { name, unit: "m", value: metres };

export const toSurfaceWavelengthDiagnostics = ({
  exportsWavelength,
  family,
  oursWavelength,
}: {
  exportsWavelength?: number | undefined;
  family: string;
  oursWavelength?: number | undefined;
}): ParityPassDiagnostic[] => [
  toWavelengthDiagnostic(`${family} surface detail wavelength, exports`, exportsWavelength),
  toWavelengthDiagnostic(`${family} surface detail wavelength, ours`, oursWavelength),
];
