import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { writeLedgerCoverage } from "#src/services/sweeps/ledgerCoverage/writeLedgerCoverage";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(writeLedgerCoverage, () => {
  const TEST_PREFIX = "ledger-coverage-";
  const LEDGER_FILE = `${LEDGER_DIRECTORY}/quality/tooling.md`;
  const CLEAN_LEDGER_FILE = `${LEDGER_DIRECTORY}/testing.md`;
  const SOURCE_FILE = "apps/realtime/src/index.ts";
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), TEST_PREFIX));
    mkdirSync(join(root, LEDGER_DIRECTORY, "quality"), { recursive: true });
    mkdirSync(join(root, "apps/realtime/src"), { recursive: true });
    writeFileSync(join(root, LEDGER_FILE), "ledger");
    writeFileSync(join(root, SOURCE_FILE), "source");
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("writes the ledger files the sync changed, and no file it left alone", () => {
    expect.hasAssertions();

    expect(
      writeLedgerCoverage(
        [
          { ledger: "quality/tooling", ledgerPath: LEDGER_FILE, rewrittenText: "rewritten", text: "ledger" },
          { ledger: "testing", ledgerPath: CLEAN_LEDGER_FILE, rewrittenText: "same", text: "same" },
        ],
        root,
      ),
    ).toStrictEqual([LEDGER_FILE]);
    expect(readFileSync(join(root, LEDGER_FILE), "utf8")).toBe("rewritten");
    expect(existsSync(join(root, CLEAN_LEDGER_FILE))).toBe(false);
  });

  test("refuses a file outside the ledger directory before it writes any file", () => {
    expect.hasAssertions();

    expect(() =>
      writeLedgerCoverage(
        [
          { ledger: "quality/tooling", ledgerPath: LEDGER_FILE, rewrittenText: "rewritten", text: "ledger" },
          { ledger: "apps/realtime", ledgerPath: SOURCE_FILE, rewrittenText: "rewritten", text: "source" },
        ],
        root,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: apps/realtime/src/index.ts, the coverage sweep writes only files under .agents/ledgers]`,
    );
    expect(readFileSync(join(root, LEDGER_FILE), "utf8")).toBe("ledger");
    expect(readFileSync(join(root, SOURCE_FILE), "utf8")).toBe("source");
  });
});
