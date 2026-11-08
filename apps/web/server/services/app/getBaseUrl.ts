// The site's base url without its trailing slash, so a path can be joined onto it
export const getBaseUrl = () => process.env.BASE_URL.replace(/\/$/u, "");
