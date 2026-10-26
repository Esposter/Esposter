// The one event an export request publishes. It names the export's row, which the handler builds the archive for. The
// Row's blob name is what the archive is written to
export interface ExportUserDataEventGridData {
  dataExportId: string;
}
