export interface SharedExportFinding {
  // The one package outside `packages/shared` naming the export, when there is one — the export's new home
  consumerPackagePath?: string;
  name: string;
  path: string;
}
