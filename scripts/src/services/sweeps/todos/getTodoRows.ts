import type { TodoMarker } from "#src/models/sweeps/todos/TodoMarker";

import { TodoLinkState } from "#src/models/sweeps/todos/TodoLinkState";
import { TODO_LINK_STATE_ORDER } from "#src/services/sweeps/todos/constants";

// Every marker beside the state its link says now, in the order the states are listed, then by link and site
export const getTodoRows = (markers: TodoMarker[], linkStates: Map<string, TodoLinkState>) =>
  markers
    .map(({ isUnfiled, line, path, url }) => ({
      site: `${path}:${line}`,
      state: isUnfiled ? TodoLinkState.Unfiled : (linkStates.get(url) ?? TodoLinkState.Unchecked),
      url,
    }))
    .toSorted(
      (firstRow, secondRow) =>
        TODO_LINK_STATE_ORDER.indexOf(firstRow.state) - TODO_LINK_STATE_ORDER.indexOf(secondRow.state) ||
        `${firstRow.url} ${firstRow.site}`.localeCompare(`${secondRow.url} ${secondRow.site}`, undefined, {
          numeric: true,
        }),
    );
