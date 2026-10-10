// An open code-scanning alert as the REST API lists it, GitHub's own spelling: the file its newest instance is in
export interface CodeScanningAlert {
  most_recent_instance: { location: { path: string } };
}
