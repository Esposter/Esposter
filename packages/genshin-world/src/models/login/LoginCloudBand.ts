// One of the login sky's three cloud emitters: the cloud sea's billows, the middle cumulus and the top cumulus
export const LoginCloudBand = { Bottom: "bottom", Middle: "middle", Top: "top" } as const;
export type LoginCloudBand = (typeof LoginCloudBand)[keyof typeof LoginCloudBand];
