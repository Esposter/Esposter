import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { Dataset } from "#shared/models/dataset/Dataset";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { VisualDatasetShape } from "@/models/dashboard/VisualDatasetShape";
import { checkIsAxisVisualPropsData } from "@/services/dashboard/checkIsAxisVisualPropsData";
import { computeDatasetVisualPropsData } from "@/services/dashboard/dataset/computeDatasetVisualPropsData";
import { VisualTypeDatasetShapeMap } from "@/services/dashboard/dataset/VisualTypeDatasetShapeMap";
import { createDrawnDataset } from "@/services/dashboard/export/createDrawnDataset";
import { createDatasetCsv } from "@/services/dataset/createDatasetCsv";
import { getDatasetTruncationText } from "@/services/dataset/getDatasetTruncationText";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { useAlertStore } from "@/store/alert";
import { downloadFile, takeOne } from "@esposter/shared";

// The rows a bound visual draws, as a CSV named after the visual. A card's file is its one value.
// A pie or a radial bar draws only its first series, so its file holds that one column.
// Every other visual with categories writes the grouped rows its table draws, which are the numbers its chart draws too.
// No visual reads a second query.
export const exportDashboardVisualCsv = (visual: Visual, dataset: Dataset) => {
  const query = visual.dataset?.query;
  const shape = VisualTypeDatasetShapeMap[visual.type];
  if (!query || shape === VisualDatasetShape.None) return;

  const drawnVisualType = shape === VisualDatasetShape.Single ? visual.type : VisualType.Table;
  const drawnQuery = shape === VisualDatasetShape.Labels ? { ...query, series: [takeOne(query.series)] } : query;
  const drawn = computeDatasetVisualPropsData(drawnVisualType, dataset, drawnQuery);
  if (!drawn || !checkIsAxisVisualPropsData(drawn)) return;
  // A capped read still downloads, since the rows read are the file, but the alert says they are not every row
  const truncation = getDatasetTruncation(dataset);
  if (truncation) {
    const alertStore = useAlertStore();
    const { createAlert } = alertStore;
    createAlert(getDatasetTruncationText(truncation), "warning");
  }
  downloadFile(
    `${visual.chart.configuration.title || visual.type}.csv`,
    createDatasetCsv(createDrawnDataset(shape, query, drawn)),
    DataSourceConfigurationMap[DataSourceType.Csv].mimeType,
  );
};
