import type { ReserveWindow } from "../../../types";

import { formatResetsAt } from "./formatResetsAt";

// The sentence a reserve opens with, naming its tier, window, the usage line that window has passed and its reset time,
// Which the system section and the toast both say
export const getReserveSummary = ({ isWindDown, name, percentage, resetsAt }: ReserveWindow): string =>
  `${isWindDown ? "Usage reserve" : "Usage maintenance"}: the ${name} usage window has passed ${percentage}% and resets at ${formatResetsAt(resetsAt)}`;
