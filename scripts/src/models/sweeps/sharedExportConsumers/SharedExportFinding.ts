export interface SharedExportFinding {
  // The one package outside `packages/shared` naming the export, when there is one — the export's new home
  consumerPackagePath?: string | undefined;
  name: string;
  path: string;
}
