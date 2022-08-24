declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
      FACEBOOK_CLIENT_ID: string;
    }
  }
}

export {}
