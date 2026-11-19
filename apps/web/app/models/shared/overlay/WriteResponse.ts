import type { Arrival } from "#src/models/shared/overlay/Arrival";
import type { Confirmation } from "#src/models/shared/overlay/Confirmation";

// What a write's server answer brings: the rows it returned, and the versions of every row it changed
export interface WriteResponse {
  arrivals: Arrival[];
  confirmed: Confirmation[];
}
