// The host this browser paired with. The credential is its own, sent only once the host has signed the page's
// Challenge with the key whose public half is kept here. An empty credential is a page not paired yet
export interface PairedHost {
  address: string;
  credential: string;
  deviceId: string;
  publicKey: string;
}
