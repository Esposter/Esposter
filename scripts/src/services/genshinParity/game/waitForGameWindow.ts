import { GAME_EXECUTABLE_NAME } from "#src/services/genshinParity/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { basename, extname } from "node:path";

const PROCESS_NAME = basename(GAME_EXECUTABLE_NAME, extname(GAME_EXECUTABLE_NAME));
// Up to five minutes for the game to open its window, so a recording can be started before the game is and take it
// From its first frame
const SCRIPT = `
$deadline = (Get-Date).AddMinutes(5)
do {
  if (Get-Process -Name ${PROCESS_NAME} -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 }) { "open"; exit }
  Start-Sleep -Milliseconds 100
} while ((Get-Date) -lt $deadline)
`;

export const waitForGameWindow = (): void => {
  const output = execFileSync("powershell", ["-NoProfile", "-Command", SCRIPT], { encoding: "utf8" });
  if (output.trim() !== "open")
    throw new InvalidOperationError(Operation.Read, GAME_EXECUTABLE_NAME, "opened no window within five minutes");
};
