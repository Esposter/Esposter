import { KIT_MODULE_PACKAGE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import ts from "typescript";

// One program over kit modules under the world package's own configuration, so each is typed as the package types it
export const createKitModuleProgram = (files: readonly string[]): ts.Program => {
  const configurationPath = join(KIT_MODULE_PACKAGE_DIRECTORY, "tsconfig.json");
  const configuration = ts.getParsedCommandLineOfConfigFile(
    configurationPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new InvalidOperationError(
          Operation.Read,
          configurationPath,
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        );
      },
    },
  );
  return ts.createProgram(files, { ...configuration?.options, noEmit: true });
};
