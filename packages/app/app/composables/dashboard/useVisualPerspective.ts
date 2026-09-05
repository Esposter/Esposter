import type ApexCharts from "apexcharts";

// Registers the feature that puts `chart.perspectives` on the instance; opt-in since v7
import "apexcharts/features/perspectives";
import { DASHBOARD_VIEW_QUERY_KEY } from "@/services/dashboard/chart/constants";
import { parseViewEntry } from "@/services/dashboard/chart/parseViewEntry";
import { setViewEntryToken } from "@/services/dashboard/chart/setViewEntryToken";
import { getResult, noop } from "@esposter/shared";

// A zoom window, the series someone hid and the points they selected are the reader's work, so it lives in the
// Url rather than dying with the tab: one entry per visual, so a link carries the state of every chart its
// Sender touched and the recipient opens the dashboard already looking at it
export const useVisualPerspective = (visualId: MaybeRefOrGetter<string>, getChart: () => ApexCharts | undefined) => {
  const router = useRouter();
  const { currentRoute } = router;
  // The parameter repeats, so vue-router hands back a string for one entry and an array for several
  const viewEntries = computed(() => {
    const view = currentRoute.value.query[DASHBOARD_VIEW_QUERY_KEY];
    if (!view) return [];

    return (Array.isArray(view) ? view : [view]).filter((entry) => typeof entry === "string");
  });
  const applyView = () => {
    const chart = getChart();
    if (!chart) return;

    const visualIdValue = toValue(visualId);
    const entry = viewEntries.value.find((viewEntry) => parseViewEntry(viewEntry).visualId === visualIdValue);
    if (!entry) return;

    // A link is hand-editable and outlives the chart it was captured from, so a token that no longer decodes
    // Opens the dashboard unfiltered rather than raising something the reader can do nothing about
    getResult(() => {
      chart.perspectives.apply(parseViewEntry(entry).token);
    }).match(noop, console.error);
  };
  const readViewUrl = () => {
    const chart = getChart();
    const token = chart ? getResult(() => chart.perspectives.encode(chart.perspectives.capture())).unwrapOr("") : "";
    const entries = setViewEntryToken(viewEntries.value, toValue(visualId), token);
    const { href } = router.resolve({ query: { ...currentRoute.value.query, [DASHBOARD_VIEW_QUERY_KEY]: entries } });
    return new URL(href, window.location.origin).href;
  };
  return { applyView, readViewUrl };
};
