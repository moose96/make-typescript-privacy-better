import { describe, it, expect } from 'vitest';
import { ConstructorTransformer } from '../../plugin/constructor-transformer';
import { SymbolInjector } from '../../plugin/symbol-injector';
import { TestUtilities, testUtilities } from './utility/test-utilities';

describe('ConstructorTransformer', () => {
  it.each([
    {
      className: 'TestClass',
      propertyNames: ['property'],
      classBodyInput: 'constructor(private property: string) {}',
      createClassBodyOutput: (properties: string[]) => `
        constructor(property: string) {
          this${properties[0]} = property;
        }
        private ${properties[0]}: string;
      `,
    },
    {
      className: 'TestClass',
      propertyNames: ['property'],
      classBodyInput: 'constructor(property: string) {}',
      createClassBodyOutput: (_: string[]) => `
        constructor(property: string) {}
      `,
    },
    {
      className: 'TestClass',
      propertyNames: ['property1', 'property2'],
      classBodyInput: 'constructor(private property1: string, private property2: number) {}',
      createClassBodyOutput: (properties: string[]) => `
        constructor(property1: string, property2: number) {
          this${properties[0]} = property1;
          this${properties[1]} = property2;
        }
        private ${properties[0]}: string;
        private ${properties[1]}: number;
      `,
    },
    {
      className: 'TestClass',
      propertyNames: ['property1', 'property2'],
      classBodyInput: 'constructor(private property1: string, public property2: number) {}',
      createClassBodyOutput: (properties: string[]) => `
        constructor(property1: string, public property2: number) {
          this${properties[0]} = property1;
        }
        private ${properties[0]}: string;
      `,
    },
    {
      className: '',
      propertyNames: ['property1'],
      classBodyInput: 'constructor(private property1: string) {}',
      createClassBodyOutput: (properties: string[]) => `
        constructor(property1: string) {
          this${properties[0]} = property1;
        }
        private ${properties[0]}: string;
      `,
    },
  ])(
    'should transform constructor parameters for: $classBodyInput',
    ({ classBodyInput, createClassBodyOutput, className, propertyNames }) => {
      const testClass = testUtilities.createClass(`
      class ${className} {
        ${classBodyInput}
      }
    `);
      const constructorDeclaration = TestUtilities.getDefaultConstructor(testClass);
      const constructorTransformer = new ConstructorTransformer();

      propertyNames.forEach(() => constructorTransformer.transform(testClass, constructorDeclaration));

      const newProperties = propertyNames.map(
        (propertyName) => `[${SymbolInjector.createSymbolName(className || 'AnonymousClass', propertyName)}]`,
      );

      expect(testClass).toMatchTypescriptCode(`
      class ${className} {
        ${createClassBodyOutput(newProperties)}
      }
    `);
    },
  );
});
