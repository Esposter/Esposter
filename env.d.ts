declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      BASE_URL: string;
      FACEBOOK_CLIENT_ID: string;
      AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
      AZURE_BLOB_URL: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};
