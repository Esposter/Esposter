export const INDEX_PATH = "/";
export const ABOUT_PATH = "/about";
export const MESSAGES_PATH = (id: string) => `/messages/${id}`;

export const isProd = process.env.NODE_ENV === "production";
export const SITE_DOMAIN = isProd ? "https://esposter.com" : "http://localhost:3000";

export const ROOM_MAX_NAME_LENGTH = 100;

/* public folder paths */
export const FAVICON_32x32_PATH = "/icons/favicon-32x32.png";
export const FAVICON_16x16_PATH = "/icons/favicon-16x16.png";

/* cookie names, yum! C: */
export const THEME_COOKIE_NAME = "theme";

/* 3rd party constants */
export const PRIVACY_POLICY_PATH = "https://www.termsfeed.com/live/367522f3-27be-4faa-a7bd-dda7b419a8fc";
export const TERMS_AND_CONDITIONS_PATH = "https://www.termsfeed.com/live/7202726c-ae87-41cd-af54-9bde6ca4477a";

export const BLOB_URL = isProd ? "https://esposter.blob.core.windows.net" : "https://esposterdev.blob.core.windows.net";
export const LOGO_IMAGE_URL = `${BLOB_URL}/assets/Esposter/logo.jpeg`;
