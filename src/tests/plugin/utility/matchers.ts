import { ClassDeclaration, MethodDeclaration, SourceFile, StructureKind } from 'ts-morph';
import { ExpectationResult, ExpectStatic, MatcherState } from '@vitest/expect';
import { testUtilities } from './test-utilities';

interface TypescriptTestUtilityMatchers<R = unknown> {
  toMatchTypescriptCode: <A>(arg: A) => R;
  itsBodyMatchesTypescriptCode: <A>(arg: A) => R;
}

declare module 'vitest' {
  interface Matchers<T = any> extends TypescriptTestUtilityMatchers<T> {}
}

export function extendsMatchers(expect: ExpectStatic) {
  expect.extend({
    toMatchTypescriptCode(received, expected) {
      return matchGenerically(this, received, expected);
    },
    itsBodyMatchesTypescriptCode(received, expected) {
      return matchGenerically(this, received, expected, { matchBody: true });
    },
  });
}

interface MatchGenericallyOptions {
  matchBody?: boolean;
}

function matchGenerically(
  state: MatcherState,
  received: any,
  expected: unknown,
  options: MatchGenericallyOptions = {},
): ExpectationResult {
  const expectedFile = parseExpected(expected);
  const receivedFile = parseReceived(received, options);

  const receivedText = receivedFile.getFullText().replace(/\s*\n\s*/gm, '');
  const expectedText = expectedFile.getFullText().replace(/\s*\n\s*/gm, '');

  return {
    pass: receivedText === expectedText,
    message: () => {
      return `Expected '${receivedText}' to match '${expectedText}'`;
    },
    expected: expectedText,
    actual: receivedText,
  };
}

function parseExpected(expected: unknown) {
  if (typeof expected !== 'string') {
    throw new Error('Expected value must be a string representing TypeScript code.');
  }

  return testUtilities.createFile(expected, 'expected.ts');
}

function parseReceived(received: any, options: MatchGenericallyOptions = {}) {
  const sourceFile = testUtilities.createFile('', 'received.ts');

  if (received.kind === StructureKind.VariableStatement) {
    sourceFile.addVariableStatement(received);
  } else if (received instanceof SourceFile || received instanceof ClassDeclaration) {
    sourceFile.replaceWithText(received.getFullText());
  } else if (received instanceof MethodDeclaration && options?.matchBody) {
    sourceFile.replaceWithText(options?.matchBody ? (received.getBodyText() ?? '') : received.getFullText());
  }

  return sourceFile;
}
