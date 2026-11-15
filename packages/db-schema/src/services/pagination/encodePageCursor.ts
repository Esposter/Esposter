import type { PageCursor } from "#src/models/pagination/PageCursor";

// The cursor on the wire: base64url of the JSON pair, opaque to the client. The start of a list is the empty string, the
// App's absent string, so a read that answers its last page answers ""
export const encodePageCursor = ({ isBackward, values }: PageCursor): string =>
  values.length === 0
    ? ""
    : btoa(JSON.stringify([isBackward, values]))
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replace(/[=]+$/u, "");
