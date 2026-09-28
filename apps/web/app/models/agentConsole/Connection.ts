// A host this browser paired with — this computer's, or a machine of the reader's own — kept across reloads. The
// Credential is this browser's own, sent only once the host has signed the page's challenge with the key whose
// Public half is kept here
export interface Connection {
  address: string;
  credential: string;
  deviceId: string;
  id: string;
  publicKey: string;
}
