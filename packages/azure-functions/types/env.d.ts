declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AZURE_EVENT_GRID_TOPIC_ENDPOINT: string;
      AZURE_EVENT_GRID_TOPIC_KEY: string;
      AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
      AZURE_WEB_PUBSUB_CONNECTION_STRING: string;
      BASE_URL: string;
      DATABASE_URL: string;
      VAPID_PRIVATE_KEY: string;
      VAPID_PUBLIC_KEY: string;
    }
  }
}

export {};
