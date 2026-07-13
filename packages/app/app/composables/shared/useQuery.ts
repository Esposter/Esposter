import { getConcurrentFunction } from "#shared/util/function/getConcurrentFunction";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useAlertStore } from "@/store/alert";
import { getResultAsync } from "@esposter/shared";

interface QueryOptions<TResult> {
  onSuccess?: (result: TResult) => void;
}

export const useQuery = <TResult>(query: () => Promise<TResult>, { onSuccess }: QueryOptions<TResult> = {}) => {
  const { createAlert } = useAlertStore();
  const data = shallowRef<TResult>();
  const refresh = getConcurrentFunction(async (checkIsStale) => {
    await getResultAsync(query).match(
      (result) => {
        if (checkIsStale()) return;
        data.value = result;
        onSuccess?.(result);
      },
      (error) => {
        if (checkIsStale()) return;
        createAlert(error.message, "error");
      },
    );
  });
  // Fetch on setup without blocking it — no Suspense boundary, unlike a top-level awaited query
  getSynchronizedFunction(refresh)();
  return { data, refresh };
};
