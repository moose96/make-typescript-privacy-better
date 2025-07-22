import { ExpectStatic } from 'vitest';
import { ExpectationResult, MatcherState } from '@vitest/expect';
import { ClassDeclaration, Project, SourceFile, StructureKind } from 'ts-morph';

interface TypescriptTestUtilityMatchers<R = unknown> {
  toMatchTypescriptCode: <A>(arg: A) => R;
}

declare module 'vitest' {
  interface Matchers<T = any> extends TypescriptTestUtilityMatchers<T> {}
}

export class TypescriptTestUtility {
  private static _instance: TypescriptTestUtility | null = null;

  static get instance(): TypescriptTestUtility {
    if (!this._instance) {
      throw new Error(
        'TypescriptTestUtility has not been initialized. Call TypescriptTestUtility.create(expect) first.',
      );
    }
    return this._instance;
  }

  static set instance(value: TypescriptTestUtility) {
    this._instance = value;
  }

  private project = new Project({
    useInMemoryFileSystem: true,
  });
  private workingFile = this.project.createSourceFile('working.ts', '', { overwrite: true });
  private expectedFile = this.project.createSourceFile('expected.ts', '', { overwrite: true });

  private constructor(expect: ExpectStatic) {
    const parentThis = this;

    expect.extend({
      toMatchTypescriptCode(...args) {
        return parentThis.toMatchTypescriptCode.call(parentThis, this, ...args);
      },
    });
  }

  static create(expect: ExpectStatic) {
    if (!this._instance) {
      this._instance = new TypescriptTestUtility(expect);
    }
    return this._instance;
  }

  createEmptyFile() {
    return this.project.createSourceFile('mock.ts', '', { overwrite: true });
  }

  createClass(code: string) {
    const file = this.project.createSourceFile('mock.ts', code, { overwrite: true });
    return file.getClasses()[0];
  }

  private toMatchTypescriptCode(state: MatcherState, received: any, expected: unknown): ExpectationResult {
    this.parseExpected(expected);
    this.parseReceived(received);

    const receivedText = this.workingFile.getFullText().replace(/\s*\n\s*/gm, '');
    const expectedText = this.expectedFile.getFullText().replace(/\s*\n\s*/gm, '');

    return {
      pass: receivedText === expectedText,
      message: () => {
        return `Expected '${receivedText}' to match '${expectedText}'`;
      },
      expected: expectedText,
      actual: receivedText,
    };
  }

  private parseExpected(expected: unknown) {
    if (typeof expected !== 'string') {
      throw new Error('Expected value must be a string representing TypeScript code.');
    }

    this.expectedFile.replaceWithText(expected);
  }

  private parseReceived(received: any) {
    this.workingFile.removeText();

    if (received.kind === StructureKind.VariableStatement) {
      this.workingFile.addVariableStatement(received);
      return;
    }

    if (received instanceof SourceFile || received instanceof ClassDeclaration) {
      this.workingFile.replaceWithText(received.getFullText());
      return;
    }
  }
}
