import type { ReserveWindow } from "../../../types";

import { formatResetsAt } from "./formatResetsAt";

// The sentence a reserve opens with, naming its window, the usage line that window has passed and its reset time, which
// The system section and the toast both say
export const getReserveSummary = ({ isAheadOfPace, name, percentage, resetsAt }: ReserveWindow): string =>
  `Usage maintenance: the ${name} usage window has passed ${percentage}%${isAheadOfPace ? " ahead of an even pace" : ""} and resets at ${formatResetsAt(resetsAt)}`;
