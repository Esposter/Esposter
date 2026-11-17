import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";

// The query without the series at the index. A series after it moves up a place, and an order that ranked by it moves with it.
// An order that ranked by the series removed falls back to the first-seen order, since it has nothing left to rank by
export const removeDatasetQuerySeries = (query: DatasetQuery, index: number): DatasetQuery => {
  const { order } = query;
  const series = query.series.toSpliced(index, 1);
  if (order?.seriesIndex === undefined || order.seriesIndex < index) return { ...query, series };
  if (order.seriesIndex === index) return { ...query, order: undefined, series };
  return { ...query, order: { ...order, seriesIndex: order.seriesIndex - 1 }, series };
};
