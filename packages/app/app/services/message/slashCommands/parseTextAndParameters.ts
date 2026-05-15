import type { SlashCommandParameter } from "@/models/message/slashCommands/SlashCommandParameter";

import { ID_SEPARATOR, normalizeString } from "@esposter/shared";

export const parseTextAndParameters = (
  text: string,
  parameters: SlashCommandParameter[],
): { parameterValues: Record<string, string>; trailingMessage: string } => {
  const result: Record<string, string> = {};
  let remainingText = normalizeString(text);

  while (remainingText.length > 0) {
    const currentText = remainingText;
    const parameter = parameters.find(({ name }) => currentText.startsWith(`${name}${ID_SEPARATOR}`));
    if (!parameter) break;

    const { name } = parameter;
    remainingText = remainingText.slice(name.length + ID_SEPARATOR.length);

    let nextParameterStartIndex = -1;
    for (const { name: nextName } of parameters) {
      if (nextName === name) continue;
      const index = remainingText.indexOf(` ${nextName}${ID_SEPARATOR}`);
      if (index !== -1 && (nextParameterStartIndex === -1 || index < nextParameterStartIndex))
        nextParameterStartIndex = index;
    }

    if (nextParameterStartIndex === -1) {
      result[name] = remainingText;
      remainingText = "";
      break;
    } else {
      result[name] = remainingText.slice(0, nextParameterStartIndex);
      remainingText = remainingText.slice(nextParameterStartIndex + 1).trimStart();
    }
  }

  return { parameterValues: result, trailingMessage: remainingText };
};
