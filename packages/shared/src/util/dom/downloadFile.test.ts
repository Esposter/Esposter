// @vitest-environment happy-dom
import { downloadFile } from "#src/util/dom/downloadFile";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(downloadFile, () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout"] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // WebKit can abort a download whose object URL is revoked in the same tick as the click, so the revoke waits a timer
  test("the object URL is revoked after the download has started", () => {
    expect.hasAssertions();

    const URL_OBJECT = "blob:report";
    vi.spyOn(URL, "createObjectURL").mockReturnValue(URL_OBJECT);
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    downloadFile("report.csv", "a,b", "text/csv");

    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runOnlyPendingTimers();

    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith(URL_OBJECT);
  });
});
