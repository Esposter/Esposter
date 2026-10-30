import type { SetupTool } from "#src/models/setup/SetupTool";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { createSetupEnvironment } from "#src/services/setup/createSetupEnvironment.test";
import { readToolRow } from "#src/services/setup/readToolRow";
import { describe, expect, test } from "vitest";

describe(readToolRow, () => {
  const dotnet: SetupTool = {
    install: { darwin: "brew install dotnet-sdk" },
    name: ".NET 10",
    probe: { args: ["--version"], file: "dotnet", output: /^10\./mu },
  };

  test("a command whose output misses its pattern is the wrong version, and gets the install line", () => {
    expect.hasAssertions();

    const environment = createSetupEnvironment({ platform: "darwin", run: () => ({ status: 0, stdout: "9.0.100\n" }) });

    expect(readToolRow(dotnet, environment)).toStrictEqual({
      next: "brew install dotnet-sdk",
      status: SetupStatus.NeedsYou,
      step: ".NET 10",
    });
  });

  test("a file tool is in place when its file exists on this platform", () => {
    expect.hasAssertions();

    const edge: SetupTool = { install: {}, name: "Microsoft Edge", paths: { win32: String.raw`C:\Edge\msedge.exe` } };
    const environment = createSetupEnvironment({
      exists: (path) => path === String.raw`C:\Edge\msedge.exe`,
      platform: "win32",
    });

    expect(readToolRow(edge, environment)).toStrictEqual({ next: "", status: SetupStatus.Ok, step: "Microsoft Edge" });
  });
});
