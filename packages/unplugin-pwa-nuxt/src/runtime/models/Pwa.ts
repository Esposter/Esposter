export interface Pwa {
  needRefresh: boolean;
  offlineReady: boolean;
  registrationError: boolean;
  updateServiceWorker: () => Promise<void>;
}
