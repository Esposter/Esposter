import { MimeType } from "#shared/models/file/MimeType";
import { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";
import { captureFlowchart } from "@/services/capture/captureFlowchart";
import { useAlertStore } from "@/store/alert";
import { downloadFile, getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";

// The page as it is drawn: the grid holds every tile, and the capture reads it at its rendered size once the fonts are in
export const exportDashboardPng = async (name: string) => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  await getResultAsync(async () => {
    const grid = window.document.querySelector<HTMLElement>(".dashboard-grid");
    if (!grid) throw new InvalidOperationError(Operation.Read, exportDashboardPng.name, "Dashboard has no grid");

    await window.document.fonts.ready;
    const png = await captureFlowchart(grid, FlowchartExportFormat.Png);
    downloadFile(`${name}.png`, png, MimeType.Png);
  }).match(noop, () => {
    createAlert("Couldn't export this dashboard", "error");
  });
};
