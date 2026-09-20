import { InvalidOperationError, Operation } from "@esposter/shared";
import ts from "typescript";

const VOICE_PROPERTY = "voice";

// The card with its `voice` initializer replaced and nothing else touched. The property is found by parsing the
// Card rather than by matching its text, so a card the formatter has wrapped, re-ordered or commented is still
// Edited at exactly the span of its voice object — and a card with no such property is an error rather than a
// Silent no-op
export const replaceCardVoice = (card: string, cardPath: string, voiceText: string): string => {
  const sourceFile = ts.createSourceFile(cardPath, card, ts.ScriptTarget.Latest, true);
  let initializer: ts.Expression | undefined;
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === VOICE_PROPERTY)
      initializer = node.initializer;
    else ts.forEachChild(node, (child) => visit(child));
  };
  visit(sourceFile);
  if (!initializer) throw new InvalidOperationError(Operation.Update, replaceCardVoice.name, cardPath);

  return `${card.slice(0, initializer.getStart(sourceFile))}${voiceText}${card.slice(initializer.getEnd())}`;
};
