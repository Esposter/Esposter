import { createColor } from "#src/services/shared/createColor";
import { printTable } from "#src/services/shared/printTable";
import { GITHUB_URL_PREFIX } from "#src/services/sweeps/todos/constants";
import { readClosedGitHubLinks } from "#src/services/sweeps/todos/readClosedGitHubLinks";
import { readTodoMarkers } from "#src/services/sweeps/todos/readTodoMarkers";
import { timeCommand } from "#src/services/timing/timeCommand";

timeCommand("ai:todos:report");

const REMOVE_ACTION = "remove";
const FILE_ACTION = "file";
// `pnpm ai:todos:report` — the markers that are work now, and nothing else: a workaround whose GitHub issue or pull
// Request upstream has closed or merged, to remove once the fix is in the version the catalog resolves, and a marker
// No issue has been filed for yet. A marker still waiting on upstream is not a row (`todos` skill)
const color = createColor(!process.env.NO_COLOR);
const markers = readTodoMarkers();
const closedLinks = readClosedGitHubLinks([
  ...new Set(markers.flatMap(({ url }) => (url.startsWith(GITHUB_URL_PREFIX) ? [url] : []))),
]);
const rows = markers
  .flatMap(({ isUnfiled, line, path, url }) => {
    if (isUnfiled) return [[FILE_ACTION, "", `${path}:${line}`]];
    else if (closedLinks.has(url)) return [[REMOVE_ACTION, url, `${path}:${line}`]];
    return [];
  })
  .toSorted((firstRow, secondRow) =>
    firstRow.join(" ").localeCompare(secondRow.join(" "), undefined, { numeric: true }),
  );

if (rows.length === 0) console.info("No marker is work now");
else printTable(["Action", "Link", "Site"], rows, color);
