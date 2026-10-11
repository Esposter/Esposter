import { KIT_FRAMES_PER_SECOND } from "#src/services/genshinAssets/kits/constants";
import ts from "typescript";

// Whether an expression is a count of frames turned into seconds, divided by the frames in a second
export const checkIsKitFramesDivision = (node: ts.Node): node is ts.BinaryExpression =>
  ts.isBinaryExpression(node) &&
  node.operatorToken.kind === ts.SyntaxKind.SlashToken &&
  ts.isNumericLiteral(node.right) &&
  Number(node.right.text) === KIT_FRAMES_PER_SECOND;
