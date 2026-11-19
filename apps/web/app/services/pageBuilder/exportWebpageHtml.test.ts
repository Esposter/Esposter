import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { createTestTextDocument } from "#shared/services/pageBuilder/createTestTextDocument.test";
import { exportWebpageHtml } from "#src/services/pageBuilder/exportWebpageHtml";
import { downloadFile } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

describe(exportWebpageHtml, () => {
  test("exporting a webpage downloads one HTML file", () => {
    expect.hasAssertions();

    const name = "a";
    exportWebpageHtml(name, createTestTextDocument(1), TEST_ORIGIN);

    expect(vi.mocked(downloadFile).mock.calls).toMatchInlineSnapshot(`
      [
        [
          "a.html",
          "<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style></style></head><body><div class="text"><p>node 0</p></div></body></html>",
          "text/html",
        ],
      ]
    `);
  });
});
