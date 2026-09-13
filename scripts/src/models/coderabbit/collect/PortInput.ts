export interface PortInput {
  cwd: string;
  developSha: string;
  queueSha: string;
  reviewFixesSha: string | undefined;
}
