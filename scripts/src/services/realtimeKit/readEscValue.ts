import { ESC_ENVIRONMENT_NAME } from "#src/services/realtimeKit/constants";
import { getResultAsync } from "@esposter/shared";
import { execFileAsync } from "@esposter/shared-node/child-process";

// A value ESC holds, or undefined when it holds none. Asked once the login is known to be good (requirePulumiLogin), so a
// Failure here is the key being absent. The value is returned to the caller and never printed
export const readEscValue = async (key: string): Promise<string | undefined> =>
  (
    await getResultAsync(() =>
      execFileAsync("pulumi", ["env", "get", ESC_ENVIRONMENT_NAME, key, "--value", "string", "--show-secrets"], {
        encoding: "utf8",
      }),
    )
  ).match(
    ({ stdout }) => stdout.trim(),
    () => undefined,
  );
