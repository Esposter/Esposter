export interface RepairInput {
  // The basis the repair's attempts are counted against (`getMarker`)
  collectorSha: string;
  cwd: string;
  isDryRun: boolean;
  mainSha: string;
  viewerLogin: string;
}
