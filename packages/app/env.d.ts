declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AZURE_BLOB_URL: string;
      AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
      BASE_URL: string;
      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
      DATABASE_URL: string;
      FACEBOOK_CLIENT_ID: string;
      FACEBOOK_CLIENT_SECRET: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
    }
  }
}

export {};
