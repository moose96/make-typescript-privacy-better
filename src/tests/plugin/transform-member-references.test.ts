import { describe, it, expect, beforeEach } from 'vitest';
import { transformMemberReferences } from '../../plugin/transform-member-references';
import { TypescriptTestUtility } from './typescript-test-utility';
import { MethodDeclaration, PropertyDeclaration } from 'ts-morph';

describe('TransformMemberReferences', () => {
  describe.each(['newMember', '[newMember]'])('given new name: %s', (newProperty) => {
    let isComputedProperty: boolean;

    beforeEach(() => {
      isComputedProperty = newProperty.startsWith('[') && newProperty.endsWith(']');
    });

    it('should transform property references', () => {
      const testClass = TypescriptTestUtility.instance.createClass(`
        class TestClass {
          property: string = '';
  
          public getProperty() {
            return this.property;
          }
        }
      `);

      transformMemberReferences(testClass.getMember('property') as PropertyDeclaration, newProperty);
      expect((testClass.getMember('getProperty') as MethodDeclaration).getBodyText()).toEqual(
        `return this${isComputedProperty ? '' : '.'}${newProperty};`,
      );
    });

    it('should transform method references', () => {
      const testClass = TypescriptTestUtility.instance.createClass(`
        class TestClass {
          method() {}
  
          public callMethod() {
            return this.method();
          }
        }
      `);

      transformMemberReferences(testClass.getMember('method') as MethodDeclaration, newProperty);
      expect((testClass.getMember('callMethod') as MethodDeclaration).getBodyText()).toEqual(
        `return this${isComputedProperty ? '' : '.'}${newProperty}();`,
      );
    });

    it('should transform property references when the property is an object', () => {
      const testClass = TypescriptTestUtility.instance.createClass(`
        class TestClass {
          property = {
            nested: 'value',
          };
  
          public getNestedProperty() {
            return this.property.nested;
          }
        }
      `);

      transformMemberReferences(testClass.getMember('property') as PropertyDeclaration, newProperty);
      expect((testClass.getMember('getNestedProperty') as MethodDeclaration).getBodyText()).toEqual(
        `return this${isComputedProperty ? '' : '.'}${newProperty}.nested;`,
      );
    });
  });
});
