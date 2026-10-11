import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

export interface OpenNextWindowInput {
  collectorSha: string;
  cwd: string;
  // The merged windows this run drained, whose replies the window's answering commits owe
  drainedPullRequests: number[];
  // The express lane's claimed commits still waiting on `main`, which an idle cut says rather than reads as synced
  expressHeldCount: number;
  // The file cap the window is cut to (`PortInput`)
  fileCap: number;
  isDryRun: boolean;
  // The open window pull requests, bottom up
  openPullRequests: WindowPullRequest[];
  viewerLogin: string;
  windowNumber: number;
}
