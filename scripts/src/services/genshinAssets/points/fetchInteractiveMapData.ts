import type { InteractiveMapResponse } from "#src/models/genshinAssets/points/InteractiveMapResponse";

import {
  INTERACTIVE_MAP_API_URL,
  INTERACTIVE_MAP_APP_SN,
  INTERACTIVE_MAP_ID,
  INTERACTIVE_MAP_LANGUAGE,
} from "#src/services/genshinAssets/points/constants";
import { fetchJson } from "#src/services/shared/fetchJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One of the map's endpoints, answered in the envelope every endpoint shares, its data the answer itself
export const fetchInteractiveMapData = async <TData>(
  endpoint: string,
  parameters: Record<string, string> = {},
): Promise<TData> => {
  const query = new URLSearchParams({
    ...parameters,
    app_sn: INTERACTIVE_MAP_APP_SN,
    lang: INTERACTIVE_MAP_LANGUAGE,
    map_id: String(INTERACTIVE_MAP_ID),
  });
  const url = `${INTERACTIVE_MAP_API_URL}/${endpoint}?${query}`;
  const { data, message, retcode } = await fetchJson<InteractiveMapResponse<TData>>(url);
  if (retcode !== 0) throw new InvalidOperationError(Operation.Read, url, message);
  return data;
};
