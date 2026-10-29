import { getListeningProcessId } from "#src/services/genshinParity/shared/getListeningProcessId";
import { getProcessStartedAt } from "#src/services/genshinParity/shared/getProcessStartedAt";

// When the process serving the parity page on a port started, in epoch milliseconds. Undefined when nothing listens there
export const getPageServerStartedAt = (port: number): number | undefined => {
  const processId = getListeningProcessId(port);
  return processId === undefined ? undefined : getProcessStartedAt(processId);
};
