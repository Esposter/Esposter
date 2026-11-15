import { ESC_ENVIRONMENT_NAME } from "#src/services/realtimeKit/constants";
import { execFileAsync } from "@esposter/shared-node/child-process";

// A value ESC holds, or undefined when it holds none. `pulumi env get` answers an absent key with nothing and exit 0,
// So a failed call is a failed read, never an absence, and it throws rather than letting the run plan a roll of a live
// Token. The value is returned to the caller and never printed
export const readEscValue = async (key: string): Promise<string | undefined> => {
  const { stdout } = await execFileAsync(
    "pulumi",
    ["env", "get", ESC_ENVIRONMENT_NAME, key, "--value", "string", "--show-secrets"],
    { encoding: "utf8" },
  );
  return stdout.trim() || undefined;
};
