import type { ReserveWindow } from "../../../types";

import { RESERVE_INSTRUCTION, USAGE_RESERVE_PERCENTAGE } from "../constants";
import { formatResetsAt } from "./formatResetsAt";

// The system section the reserve adds: the window and its reset time are the only part that varies, so the text holds
// Still for as long as the reserve does
export const reserveText = ({ name, resetsAt }: ReserveWindow): string =>
  `Usage reserve: the ${name} usage window has passed ${USAGE_RESERVE_PERCENTAGE}% and resets at ${formatResetsAt(resetsAt)}. ${RESERVE_INSTRUCTION}`;
