import { describe, expect, test } from "vitest";

import { checkIsHaikuOnlyScript } from "./checkIsHaikuOnlyScript";

describe(checkIsHaikuOnlyScript, () => {
  test.each([
    ["single-quoted haiku agents", "await agent('', { model: 'haiku' });\nawait agent('', { model: 'haiku' });"],
    ["double-quoted haiku agents", 'await agent("", { model: "haiku" });'],
    ["a haiku model after another key, with a trailing comma", "await agent('', { label: '', model: 'haiku', });"],
    [
      "haiku agents in a parallel map with interpolated prompts",
      `await parallel(units.map((unit) => () => agent(\`fix \${unit.file}\`, { label: unit.id, model: 'haiku' })));`,
    ],
    ["a haiku agent inside a template interpolation", `const note = \`\${await agent('', { model: 'haiku' })}\`;`],
    [
      "a haiku agent beside an opus agent in a comment",
      "// await agent('', { model: 'opus' });\nawait agent('', { model: 'haiku' });",
    ],
    [
      "a haiku agent beside a comment naming masked words",
      "// process the window\nawait agent('', { model: 'haiku' });",
    ],
    [
      "a haiku agent whose prompt quotes an opus agent",
      "await agent(\"write agent('', { model: 'opus' }) into the report\", { model: 'haiku' });",
    ],
    ["a haiku agent whose prompt names masked words", "await agent('process the window', { model: 'haiku' });"],
    [
      "a haiku agent after an emoji in an earlier prompt",
      "await agent('🚀', { model: 'haiku' });\nawait agent('', { model: 'haiku' });",
    ],
  ])("allows %s", (_description, script) => {
    expect.hasAssertions();

    expect(checkIsHaikuOnlyScript(script)).toBe(true);
  });

  test.each([
    ["mixed models", "await agent('', { model: 'haiku' });\nawait agent('', { model: 'opus' });"],
    ["an agent with no model", "await agent('', { label: '' });"],
    ["an agent with no options", "await agent('');"],
    ["an agent whose options are a variable", "await agent('', options);"],
    ["a model held in a variable", "const model = 'haiku';\nawait agent('', { model });"],
    ["a model built by concatenation", "await agent('', { model: 'hai' + 'ku' });"],
    ["a model given twice", "await agent('', { model: 'haiku', model: 'opus' });"],
    ["a model in a template literal", "await agent('', { model: `haiku` });"],
    ["a model in a nested object only", "await agent('', { schema: { model: 'haiku' } });"],
    ["a model read through a getter", "await agent('', { model: 'haiku', get model() { return 'opus'; } });"],
    ["a computed key that may name the model", "await agent('', { [key]: 'opus', model: 'haiku' });"],
    ["a quoted model key alone", "await agent('', { 'model': 'haiku' });"],
    ["a quoted model key after the haiku key", "await agent('', { model: 'haiku', 'model': 'opus' });"],
    ["an escaped model key alone", String.raw`await agent('', { 'model': 'haiku' });`],
    ["an escaped model key after the haiku key", String.raw`await agent('', { model: 'haiku', 'model': 'opus' });`],
    [
      "a line comment ended by U+2028 above an opus agent",
      "// note\u2028await agent('', { model: 'opus' });\nawait agent('', { model: 'haiku' });",
    ],
    [
      "a line comment ended by a carriage return above an opus agent",
      "// note\rawait agent('', { model: 'opus' });\nawait agent('', { model: 'haiku' });",
    ],
    ["a third argument after the options", "await agent('', { model: 'haiku' }, { model: 'opus' });"],
    [
      "a string with an escape beside the haiku model",
      String.raw`await agent('', { label: 'it\'s', model: 'haiku' });`,
    ],
    ["a model read from a method of the literal", "await agent('', { model: 'haiku'.trim() });"],
    ["a spread in the options", "await agent('', { ...shared, model: 'haiku' });"],
    ["a haiku model only in a prompt", "await agent(\"use model: 'haiku'\", { model: 'opus' });"],
    ["a prompt naming haiku with no options", "await agent(\"use model: 'haiku'\");"],
    [
      "an agent reached through a reflected name",
      "await Reflect.get(globalThis, 'agent')('', { model: 'opus' });\nawait agent('', { model: 'haiku' });",
    ],
    [
      "an agent reached through this",
      "await this['agent']('', { model: 'opus' });\nawait agent('', { model: 'haiku' });",
    ],
    [
      "a property named agent beside a haiku agent",
      "const config = { agent: '' };\nawait agent('', { model: 'haiku' });",
    ],
    ["an agent called through an alias", "const run = agent;\nawait run('', { model: 'haiku' });"],
    ["no agent calls", "log('');\nphase('');"],
    ["an empty script", ""],
    ["a child workflow beside haiku agents", "await workflow({ name: '' });\nawait agent('', { model: 'haiku' });"],
    [
      "an opus agent inside a template interpolation",
      `const note = \`\${await agent('', { model: 'opus' })}\`;\nawait agent('', { model: 'haiku' });`,
    ],
    [
      "an agent evaluated from a string",
      "await eval(\"agent('', { model: 'opus' })\");\nawait agent('', { model: 'haiku' });",
    ],
    ["a regular expression literal", "const quoted = text.replace(/'/g, '');\nawait agent('', { model: 'haiku' });"],
    [
      "a division the scan cannot tell from a regular expression",
      "const half = total / 2;\nawait agent('', { model: 'haiku' });",
    ],
    ["an escape that spells an identifier", String.raw`await agent('', { model: 'opus' });`],
    ["an HTML-style comment", "await agent('', { model: 'haiku' });\n<!-- note"],
    ["an HTML-style comment closing", "await agent('', { model: 'haiku' });\n--> note"],
    ["an agent call that never closes", "await agent('', { model: 'haiku' };"],
    ["a string left open", "await agent('', { model: 'haiku' });\nlog('unclosed);"],
    ["a template literal left open", "const note = `open;\nawait agent('', { model: 'haiku' });"],
    ["a block comment left open", "await agent('', { model: 'haiku' }); /* open"],
  ])("refuses %s", (_description, script) => {
    expect.hasAssertions();

    expect(checkIsHaikuOnlyScript(script)).toBe(false);
  });

  test.each([
    ["Function", "const make = new Function('');"],
    ["constructor", "const make = ({}).constructor;"],
    ["import", "const later = import('');"],
    ["require", "const fs = require('');"],
    ["process", "process.exit();"],
    ["globalThis", "const hub = globalThis;"],
    ["self", "const hub = self;"],
    ["window", "const hub = window;"],
  ])("refuses a script that reaches %s beside a haiku agent", (_name, reach) => {
    expect.hasAssertions();

    expect(checkIsHaikuOnlyScript(`${reach}\nawait agent('', { model: 'haiku' });`)).toBe(false);
  });

  test("refuses an absent script, which a saved workflow leaves", () => {
    expect.hasAssertions();

    expect(checkIsHaikuOnlyScript(undefined)).toBe(false);
  });
});
