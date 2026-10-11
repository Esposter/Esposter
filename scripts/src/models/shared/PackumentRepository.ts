/** The repository field of a version manifest returned for `GET /{packageName}/latest`. */
export interface PackumentRepository {
  repository?: { directory?: string; url?: string };
}
