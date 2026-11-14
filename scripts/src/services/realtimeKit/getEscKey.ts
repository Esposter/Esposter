import { ESC_KEY_PREFIX } from "#src/services/realtimeKit/constants";

// The ESC key a Worker's value is read from, `pulumiConfig.esposter-infra:<environment>_<NAME>`: the spelling the deploy
// Job reads its secrets under, so a value written here is the one the Worker is deployed with
export const getEscKey = (environment: string, name: string): string => `${ESC_KEY_PREFIX}${environment}_${name}`;
