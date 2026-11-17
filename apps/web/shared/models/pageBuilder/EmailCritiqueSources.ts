import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";

// What the email's critique reads from its caller: each colour an email sets, read the way a webpage's is. An email has no
// Survey invite that needs a lookup, so the critique asks for colours alone
export type EmailCritiqueSources = Pick<CritiqueSources, "readColor">;
