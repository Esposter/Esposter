import { POWERSHELL_QUOTE_REGEX } from "@/services/agentConsole/constants";

export const quotePowerShell = (value: string) => `'${value.replaceAll(POWERSHELL_QUOTE_REGEX, "$&$&")}'`;
