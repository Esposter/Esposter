import { readKitOverlayFile } from "#src/services/genshinAssets/kits/readKitOverlayFile";
import { checkHoldsUnclassified } from "#src/services/sweeps/ledgerCoverage/checkHoldsUnclassified";
import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";

/**
 * The ledgers whose rule a trailer cannot settle alone, each with the check that holds a unit open whatever its
 * trailers say: a kit is swept only once its overlay holds no `Unclassified` entry
 * (`openspec/specs/genshin/kits/README.md`).
 */
export const LedgerForcedOpenMap: Record<string, (unit: string) => boolean> = {
  "kit-differs-from-source": (unit) => checkHoldsUnclassified(readKitOverlayFile(normalizeLedgerUnit(unit))),
};
