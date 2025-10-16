declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AZURE_STORAGE_CONNECTION_STRING: string;
      AZURE_WEB_PUBSUB_CONNECTION_STRING: string;
      DATABASE_URL: string;
    }
  }
}

export {};
