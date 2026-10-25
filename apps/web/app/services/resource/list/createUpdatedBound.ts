import { ISO_DATE_FORMAT } from "#shared/util/date/constants";
import { formatDate } from "#shared/util/date/formatDate";
import { parseDate } from "#shared/util/date/parseDate";

// Dates can't round-trip through a query param directly, so the custom bounds serialize day-granular.
// It takes nothing from the composable it is called in, so it declares its route query once rather than per call.
export const createUpdatedBound = (key: string) => {
  const boundQuery = useRouteQuery(key, "", { transform: String });
  return computed<Date | undefined>({
    get: () => (boundQuery.value ? parseDate(boundQuery.value, ISO_DATE_FORMAT) : undefined),
    set: (value) => {
      boundQuery.value = value ? formatDate(value, ISO_DATE_FORMAT) : "";
    },
  });
};
