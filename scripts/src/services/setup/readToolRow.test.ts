import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupTool } from "#src/models/setup/SetupTool";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { readToolRow } from "#src/services/setup/readToolRow";
import { describe, expect, test, vi } from "vitest";

describe(readToolRow, () => {
  const createEnvironment = (overrides: Partial<SetupEnvironment>): SetupEnvironment => ({
    countFiles: () => undefined,
    exists: () => false,
    makeDirectory: vi.fn(),
    mainCheckoutRoot: "/Users/ada/Esposter",
    readText: () => undefined,
    run: () => ({ status: 1, stdout: "" }),
    runVisibly: () => ({ status: 1, stdout: "" }),
    ...overrides,
  });
  const dotnet: SetupTool = {
    install: { darwin: "brew install dotnet-sdk" },
    name: ".NET 10",
    probe: { args: ["--version"], file: "dotnet", output: /^10\./mu },
  };

  test("a command whose output misses its pattern is the wrong version, and gets the install line", () => {
    expect.hasAssertions();

    const environment = createEnvironment({ run: () => ({ status: 0, stdout: "9.0.100\n" }) });

    expect(readToolRow(dotnet, environment, "darwin")).toStrictEqual({
      next: "brew install dotnet-sdk",
      status: SetupStatus.NeedsYou,
      step: ".NET 10",
    });
  });

  test("a file tool is in place when its file exists on this platform", () => {
    expect.hasAssertions();

    const edge: SetupTool = { install: {}, name: "Microsoft Edge", paths: { win32: "C:\\Edge\\msedge.exe" } };
    const environment = createEnvironment({ exists: (path) => path === "C:\\Edge\\msedge.exe" });

    expect(readToolRow(edge, environment, "win32")).toStrictEqual({
      next: "",
      status: SetupStatus.Ok,
      step: "Microsoft Edge",
    });
  });
});
