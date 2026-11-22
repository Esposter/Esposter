import { UnitState } from "#src/models/sweeps/ledgerCoverage/UnitState";
import { formatUnitCoverage } from "#src/services/sweeps/ledgerCoverage/formatUnitCoverage";
import { getUnmatchedLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getUnmatchedLedgerEvents";
import { readLedgerEvents } from "#src/services/sweeps/ledgerCoverage/readLedgerEvents";
import { readLedgerStatus } from "#src/services/sweeps/ledgerCoverage/readLedgerStatus";
import { readLedgerUnitsByLedger } from "#src/services/sweeps/ledgerCoverage/readLedgerUnitsByLedger";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// Where every ledger's units stand, read from the commit trailers in this clone's full history, since no file stores
// It. With no ledger, one line per ledger counting its units by state, then every trailer naming a unit no ledger holds;
// With one, a line per unit of each ledger it names, an area-split folder naming all of its areas.
await runCommand(
  defineCommand({
    args: {
      ledger: {
        description: "A ledger, e.g. pinia or quality/packages, or a promoted ledger's folder, e.g. quality",
        required: false,
        type: "positional",
      },
    },
    meta: {
      description: "Print where each ledger's units stand, read from the Ledger, Reopens and Sampled commit trailers",
      name: "ai:sweep:status",
    },
    run: ({ args }) => {
      const events = readLedgerEvents();
      const unitsByLedger = readLedgerUnitsByLedger();
      const name = args.ledger ?? "";
      const status = readLedgerStatus(events, unitsByLedger).filter(
        ({ ledger }) => name === "" || ledger === name || ledger.startsWith(`${name}/`),
      );
      if (name !== "") {
        for (const { ledger, units } of status)
          for (const unitCoverage of units)
            console.info(`${ledger} | ${unitCoverage.unit} | ${formatUnitCoverage(unitCoverage)}`);
        return;
      }

      for (const { ledger, units } of status) {
        const counts = Object.values(UnitState).map(
          (state) => `${state.toLowerCase()} ${units.filter((unit) => unit.state === state).length}`,
        );
        console.info(`${ledger}: ${counts.join(", ")}`);
      }
      // A trailer naming a unit the tree no longer has: once its successor unit is dated, the line is read past
      for (const event of getUnmatchedLedgerEvents(events, unitsByLedger))
        console.info(`unmatched ${event.ledger}: ${event.unit} (${event.date})`);
    },
  }),
);
