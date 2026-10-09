import type { Wildlife } from "#src/models/wildlife/Wildlife";
import type { WildlifePlace } from "#src/models/wildlife/WildlifePlace";

import { WildlifeState } from "#src/models/wildlife/WildlifeState";

// An animal standing at its place, facing south and idle, its home the place it walks back to
export const createWildlife = ({ id, kind, position }: WildlifePlace): Wildlife => ({
  heading: 0,
  home: { ...position },
  id,
  kind,
  position: { ...position },
  state: WildlifeState.Idle,
  stateSeconds: 0,
});
