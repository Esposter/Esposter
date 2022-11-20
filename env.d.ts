declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AZURE_BLOB_URL: string;
      AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
      BASE_URL: string;
      DATABASE_URL: string;
      FACEBOOK_CLIENT_ID: string;
      OPENAI_API_KEY: string;
      WS_BASE_URL: string;
      WS_PORT: string;
    }
  }
}

export {};
