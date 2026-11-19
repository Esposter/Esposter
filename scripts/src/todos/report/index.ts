import { TodoLinkState } from "#src/models/sweeps/todos/TodoLinkState";
import { createColor } from "#src/services/shared/createColor";
import { printTable } from "#src/services/shared/printTable";
import { GITHUB_URL_PREFIX } from "#src/services/sweeps/todos/constants";
import { readGitHubLinkStates } from "#src/services/sweeps/todos/readGitHubLinkStates";
import { readTodoMarkers } from "#src/services/sweeps/todos/readTodoMarkers";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

const STATE_ORDER: TodoLinkState[] = Object.values(TodoLinkState);
// `pnpm ai:todos:report` — every marker beside what its link says now, what upstream has finished with first. A closed
// Issue or merged pull request is a lead, not a verdict: its workaround goes only once the fix is in the version the
// Catalog resolves (`todos` skill, `references/revisiting.md`)
await runCommand(
  defineCommand({
    meta: {
      description: "List every TODO marker beside the state of its link, the states upstream has finished with first",
      name: "ai:todos:report",
    },
    run: () => {
      const color = createColor(!process.env.NO_COLOR);
      const markers = readTodoMarkers();
      const linkStates = readGitHubLinkStates([
        ...new Set(markers.flatMap(({ url }) => (url.startsWith(GITHUB_URL_PREFIX) ? [url] : []))),
      ]);
      const rows = markers
        .map(({ isUnfiled, line, path, url }) => ({
          site: `${path}:${line}`,
          state: isUnfiled ? TodoLinkState.Unfiled : (linkStates.get(url) ?? TodoLinkState.Unchecked),
          url,
        }))
        .toSorted(
          (firstRow, secondRow) =>
            STATE_ORDER.indexOf(firstRow.state) - STATE_ORDER.indexOf(secondRow.state) ||
            `${firstRow.url} ${firstRow.site}`.localeCompare(`${secondRow.url} ${secondRow.site}`, undefined, {
              numeric: true,
            }),
        );

      if (rows.length === 0) console.info("No marker is left");
      else
        printTable(
          ["State", "Link", "Site"],
          rows.map(({ site, state, url }) => [
            state === TodoLinkState.Closed || state === TodoLinkState.Merged ? color.green(state) : state,
            url,
            site,
          ]),
          color,
        );
    },
  }),
);
