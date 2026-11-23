import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { ledgerJudgementSchema } from "#src/models/sweeps/ledgerCoverage/LedgerJudgement";
import { getBatches } from "#src/services/shared/getBatches";
import { parseWholeCount } from "#src/services/shared/parseWholeCount";
import { readJsonlRecords } from "#src/services/shared/readJsonlRecords";
import { resolveInvocationPath } from "#src/services/shared/resolveInvocationPath";
import { toJson } from "#src/services/shared/toJson";
import { writeFileAtomically } from "#src/services/shared/writeFileAtomically";
import { checkIsLedgerCellClean } from "#src/services/sweeps/ledgerCoverage/checkIsLedgerCellClean";
import {
  FIXER_UNIT_FILE_EXTENSION,
  READER_OUTPUT_EXTENSION,
  SWEPT_CELL_SEPARATOR,
  TRAILER_VALUE_SEPARATOR,
} from "#src/services/sweeps/ledgerCoverage/constants";
import { formatBatchFileName } from "#src/services/sweeps/ledgerCoverage/formatBatchFileName";
import { getLedgerFixerUnits } from "#src/services/sweeps/ledgerCoverage/getLedgerFixerUnits";
import { getLedgerJudgedCells } from "#src/services/sweeps/ledgerCoverage/getLedgerJudgedCells";
import { readLedgerSampleDirectory } from "#src/services/sweeps/ledgerCoverage/readLedgerSampleDirectory";
import { readLedgerUnitAreas } from "#src/services/sweeps/ledgerCoverage/readLedgerUnitAreas";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { join } from "node:path";

// Records a sample's readers: the cells every reader judged clean print their `Ledger:` trailers, once each, and the rest
// Are written as the units a fixer is handed. The readers' output sits beside the batch files they were handed, so the
// Directory holds both and a judgement is matched against the units its reader was given.
await runCommand(
  defineCommand({
    args: {
      directory: {
        description: "The sample's directory, holding its batch files and the readers' output",
        required: true,
        type: "positional",
      },
      fixer: {
        description: "A directory the units a fixer is handed are written into, for the cells that were not clean",
        required: false,
        type: "string",
      },
      findings: {
        default: "40",
        description: "The findings a fixer's file holds at most, one unit's line never split",
        type: "string",
      },
      model: {
        default: "Haiku 5.5",
        description: "The model the trailers name, as its Co-Authored-By trailer spells it",
        type: "string",
      },
    },
    meta: {
      description: "Print the trailers of the cells every reader judged clean, and write the rest as fixer files",
      name: "ai:sweep:record",
    },
    run: ({ args }) => {
      const directory = resolveInvocationPath(args.directory);
      const cells = getLedgerJudgedCells(
        readJsonlRecords(directory, READER_OUTPUT_EXTENSION, ledgerJudgementSchema),
        readLedgerSampleDirectory(directory),
      );
      const today = Temporal.Now.plainDateISO().toString();
      const cleanCells = cells.filter((cell) => checkIsLedgerCellClean(cell));
      for (const { ledger, unit } of cleanCells)
        console.info(
          `${LedgerEventType.Ledger}: ${ledger}${TRAILER_VALUE_SEPARATOR}${unit}${TRAILER_VALUE_SEPARATOR}${today}${SWEPT_CELL_SEPARATOR}${args.model}`,
        );

      if (args.fixer === undefined) return;
      const fixerDirectory = resolveInvocationPath(args.fixer);
      const units = getLedgerFixerUnits(
        cells.filter((cell) => !checkIsLedgerCellClean(cell)),
        readLedgerUnitAreas(),
      );
      const batches = getBatches(
        units,
        // A unit with no finding still costs one, so a file of silent units is bounded too
        (unit) => Math.max(1, unit.judgements.flatMap(({ findings }) => findings).length),
        parseWholeCount(args.findings, "findings", 1),
      );
      for (const [index, batch] of batches.entries())
        writeFileAtomically(
          join(fixerDirectory, formatBatchFileName(index, batches.length, FIXER_UNIT_FILE_EXTENSION)),
          toJson(batch),
        );
    },
  }),
);
