import { describe, expect, test } from "vitest";

import { checkIsHaikuOnlyScript } from "./checkIsHaikuOnlyScript";

describe(checkIsHaikuOnlyScript, () => {
  test.each([
    [
      "single-quoted haiku agents",
      "await agent('first', { model: 'haiku' });\nawait agent('second', { model: 'haiku' });",
    ],
    ["double-quoted haiku agents", 'await agent("first", { model: "haiku" });'],
    [
      "haiku agents in a parallel map with interpolated prompts",
      "await parallel(units.map((unit) => () => agent(`fix ${unit.file}`, { label: unit.id, model: 'haiku' })));",
    ],
    [
      "a haiku agent beside an opus agent in a comment",
      "// await agent('old', { model: 'opus' });\nawait agent('new', { model: 'haiku' });",
    ],
    [
      "a haiku agent whose prompt quotes an opus agent",
      "await agent(\"write agent('x', { model: 'opus' }) into the report\", { model: 'haiku' });",
    ],
    [
      "a haiku agent after an emoji in an earlier prompt",
      "await agent('🚀 launch', { model: 'haiku' });\nawait agent('second', { model: 'haiku' });",
    ],
  ])("allows %s", (_description, script) => {
    expect.hasAssertions();

    expect(checkIsHaikuOnlyScript(script)).toBe(true);
  });

  test.each([
    ["mixed models", "await agent('first', { model: 'haiku' });\nawait agent('second', { model: 'opus' });"],
    ["an agent with no model", "await agent('first', { label: 'cleanup' });"],
    ["an agent with no options", "await agent('first');"],
    ["an agent whose options are a variable", "await agent('first', options);"],
    ["a model held in a variable", "const model = 'haiku';\nawait agent('first', { model });"],
    ["a model built by concatenation", "await agent('first', { model: 'hai' + 'ku' });"],
    ["a model given twice", "await agent('first', { model: 'haiku', model: 'opus' });"],
    ["a model in a template literal", "await agent('first', { model: `haiku` });"],
    ["a model in a nested object only", "await agent('first', { schema: { model: 'haiku' } });"],
    ["a model read through a getter", "await agent('first', { model: 'haiku', get model() { return 'opus'; } });"],
    ["a computed key that may name the model", "await agent('first', { [key]: 'opus', model: 'haiku' });"],
    ["a quoted model key after the haiku key", "await agent('first', { model: 'haiku', 'model': 'opus' });"],
    ["an escaped model key after the haiku key", "await agent('first', { model: 'haiku', '\\u006dodel': 'opus' });"],
    [
      "an agent reached through a reflected name",
      "await Reflect.get(globalThis, 'agent')('first', { model: 'opus' });\nawait agent('second', { model: 'haiku' });",
    ],
    [
      "an agent reached through this",
      "await this['agent']('first', { model: 'opus' });\nawait agent('second', { model: 'haiku' });",
    ],
    ["a spread in the options", "await agent('first', { ...shared, model: 'haiku' });"],
    ["a haiku model only in a prompt", "await agent(\"use model: 'haiku'\", { model: 'opus' });"],
    ["a prompt naming haiku with no options", "await agent(\"use model: 'haiku'\");"],
    ["no agent calls", "log('nothing to launch');\nphase('Scan');"],
    ["an empty script", ""],
    ["an agent called through an alias", "const run = agent;\nawait run('first', { model: 'haiku' });"],
    [
      "a child workflow beside haiku agents",
      "await workflow({ name: 'other' });\nawait agent('first', { model: 'haiku' });",
    ],
    [
      "an opus agent inside a template interpolation",
      "const note = `${await agent('first', { model: 'opus' })}`;\nawait agent('second', { model: 'haiku' });",
    ],
    [
      "an agent evaluated from a string",
      "await eval(\"agent('first', { model: 'opus' })\");\nawait agent('second', { model: 'haiku' });",
    ],
    [
      "a regular expression literal",
      "const quoted = text.replace(/'/g, '');\nawait agent('first', { model: 'haiku' });",
    ],
    [
      "a division the scan cannot tell from a regular expression",
      "const half = total / 2;\nawait agent('first', { model: 'haiku' });",
    ],
    ["an escape that spells an identifier", "await \\u0061gent('first', { model: 'opus' });"],
    ["an agent call that never closes", "await agent('first', { model: 'haiku' };"],
    ["a string left open", "await agent('first', { model: 'haiku' });\nlog('unclosed);"],
    ["a block comment left open", "await agent('first', { model: 'haiku' }); /* open"],
  ])("refuses %s", (_description, script) => {
    expect.hasAssertions();

    expect(checkIsHaikuOnlyScript(script)).toBe(false);
  });

  test("refuses an absent script, which a saved workflow leaves", () => {
    expect.hasAssertions();

    expect(checkIsHaikuOnlyScript(undefined)).toBe(false);
  });
});
