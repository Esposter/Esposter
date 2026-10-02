import type clouds from "#src/data/login/clouds.json";

// One of the login sky's three cloud emitters: the cloud sea's billows, the middle cumulus and the top cumulus
export type LoginCloudBand = keyof typeof clouds;
