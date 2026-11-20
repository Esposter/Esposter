import type { TodoMarker } from "#src/models/sweeps/todos/TodoMarker";
import type { Except } from "type-fest";

import { TODO_MARKER } from "#src/services/sweeps/todos/constants";

// A marker is a workaround waiting on something outside the repository, and the link is how anyone learns that it
// Ended — so the marker is followed by the address of the thing that ends it, and nothing else comes first. The one
// Other form says no upstream issue exists yet, which the `todos` skill lists until one is filed
const TODO_REGEX = new RegExp(
  String.raw`${RegExp.escape(TODO_MARKER)}(?:: (?:(?<url>https?:\/\/[^\s"'),>\x60]+)|(?<unfiled>no upstream issue\b)))?`,
  "gu",
);
// Every marker in a file's text, with its line counted from the newlines before it
export const getTodoMarkers = (text: string): Except<TodoMarker, "path">[] =>
  text
    .split("\n")
    .flatMap((lineText, index) =>
      Array.from(lineText.matchAll(TODO_REGEX), ({ groups }) => ({
        isUnfiled: groups?.unfiled !== undefined,
        line: index + 1,
        url: groups?.url ?? "",
      })),
    );
