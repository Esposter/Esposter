import type { BackendType } from "@/models/virrun/BackendType";

import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/colorize";
import { formatVirrunLine } from "@/services/cli/formatVirrunLine";
// Start-of-run line, stderr-only — the programmatic exec path stays silent so correctness diffs that compare child
// Stdout/stderr are untouched. Reports the resolved backend (os sandbox vs native fallback) so an unsupported-host
// Degrade is visible. Color highlights the moving parts (command, backend, node) so the banner reads at a glance.
export const formatVirrunBanner = ({
  backend,
  command,
  nodeVersion,
}: {
  backend: BackendType;
  command: readonly string[];
  nodeVersion: string;
}): string =>
  formatVirrunLine(
    `running "${colorize(command.join(" "), Color.Yellow)}" (backend=${colorize(backend, Color.Blue)}, node=${colorize(nodeVersion, Color.Green)})`,
  );
