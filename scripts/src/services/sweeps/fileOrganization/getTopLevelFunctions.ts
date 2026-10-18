import type { TopLevelFunction } from "#src/models/sweeps/fileOrganization/TopLevelFunction";

import { checkIsExported } from "#src/services/sweeps/fileOrganization/checkIsExported";
import { checkIsFunctionInitializer } from "#src/services/sweeps/fileOrganization/checkIsFunctionInitializer";
import ts from "typescript";

// Every top-level function a file declares, in source order: a `function` declaration, its overloads counted once, and
// A `const` or `let` whose initializer is a function. The file is parsed rather than matched, since an arrow's
// Parameter list spans lines and its type annotation holds a `=>` of its own. Nothing nested in a function, an object
// Literal or a class is counted, and a class is not either
export const getTopLevelFunctions = (text: string): TopLevelFunction[] => {
  const sourceFile = ts.createSourceFile("", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const functions: TopLevelFunction[] = [];
  for (const statement of sourceFile.statements)
    if (ts.isFunctionDeclaration(statement) && statement.name)
      functions.push({ isExported: checkIsExported(statement), name: statement.name.text });
    else if (ts.isVariableStatement(statement))
      for (const declaration of statement.declarationList.declarations)
        if (ts.isIdentifier(declaration.name) && checkIsFunctionInitializer(declaration.initializer))
          functions.push({ isExported: checkIsExported(declaration), name: declaration.name.text });
  return functions.filter(({ name }, index) => functions.findIndex((other) => other.name === name) === index);
};
