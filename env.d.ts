declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      FACEBOOK_CLIENT_ID: string;
      AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {}
