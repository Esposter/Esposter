declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
      AZURE_BLOB_URL: string;
      BASE_URL: string;
      DATABASE_URL: string;
      FACEBOOK_CLIENT_ID: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};
