import type { LedgerCoverage } from "#src/models/sweeps/ledgerCoverage/LedgerCoverage";
import type { LedgerSample } from "#src/models/sweeps/ledgerCoverage/LedgerSample";

import { UnitState } from "#src/models/sweeps/ledgerCoverage/UnitState";
import { getSeededRank } from "#src/services/sweeps/ledgerCoverage/getSeededRank";
import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";

interface SampledQuestion {
  judged: number;
  ledger: string;
  openUnits: Set<string>;
  target: number;
  units: string[];
}

// The units to read next. Each question's open cells are drawn in a seeded order, rarest question first, until it holds
// Its target of judged cells or every open cell it has. A drawn unit is judged for every question still short of its
// Own target that holds it open, so a question can be full before its own draws reach it.
export const getLedgerSample = (
  statuses: readonly LedgerCoverage[],
  seed: string,
  sampleSize: number,
): LedgerSample[] => {
  const questions: SampledQuestion[] = statuses
    .map(({ ledger, units }) => {
      const openUnits = units.filter(({ state }) => state === UnitState.Open).map(({ unit }) => unit);
      return {
        judged: 0,
        ledger,
        openUnits: new Set(openUnits),
        target: Math.min(sampleSize, openUnits.length),
        units: openUnits.toSorted((firstUnit, secondUnit) =>
          getSeededRank(seed, firstUnit).localeCompare(getSeededRank(seed, secondUnit)),
        ),
      };
    })
    .toSorted(
      (firstQuestion, secondQuestion) =>
        firstQuestion.openUnits.size - secondQuestion.openUnits.size ||
        firstQuestion.ledger.localeCompare(secondQuestion.ledger),
    );

  const samples = new Map<string, LedgerSample>();
  for (const question of questions)
    for (const unit of question.units) {
      if (question.judged >= question.target) break;
      if (samples.has(unit)) continue;

      const judgedQuestions = questions.filter(
        (candidate) => candidate.judged < candidate.target && candidate.openUnits.has(unit),
      );
      for (const judgedQuestion of judgedQuestions) judgedQuestion.judged += 1;
      samples.set(unit, { ledgers: judgedQuestions.map(({ ledger }) => ledger), unit: normalizeLedgerUnit(unit) });
    }

  return [...samples.values()];
};
