import type { Environment } from "#shared/models/environment/Environment";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_ENV: Environment;
      AZURE_CONTAINER_BASE_URL: string;
      AZURE_EVENT_GRID_TOPIC_ENDPOINT: string;
      AZURE_EVENT_GRID_TOPIC_KEY: string;
      AZURE_FUNCTION_BASE_URL: string;
      AZURE_FUNCTION_KEY: string;
      AZURE_SEARCH_API_KEY: string;
      AZURE_STORAGE_ACCOUNT_CONNECTION_STRING: string;
      AZURE_WEB_PUBSUB_CONNECTION_STRING: string;
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
      VAPID_PRIVATE_KEY: string;
      VAPID_PUBLIC_KEY: string;
    }
  }
}

export {};
