import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";

import { SHORT_HASH_LENGTH } from "#src/services/genshinParity/reference/constants";

// The one line a pack ends with, naming each colliding id with the leading digits of the hash of its local bytes.
// The hash of the committed bytes it differs from is named the same way
export const formatCollisionBlock = (collisions: ReferenceCollision[]): string =>
  `colliding ${collisions.length}: ${collisions
    .map(
      ({ committed, id, ours }) =>
        `${id} (ours ${ours.slice(0, SHORT_HASH_LENGTH)} vs committed ${committed.slice(0, SHORT_HASH_LENGTH)})`,
    )
    .join(", ")}`;
