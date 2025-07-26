import { describe, it, expect, beforeEach } from 'vitest';
import { transformMemberReferences } from '../../plugin/transform-member-references';
import { MethodDeclaration, PropertyDeclaration } from 'ts-morph';
import { TestUtilities, testUtilities } from './utility/test-utilities';

describe('TransformMemberReferences', () => {
  describe.each(['newMember', '[newMember]'])('given new name: %s', (newProperty) => {
    let isComputedProperty: boolean;

    beforeEach(() => {
      isComputedProperty = TestUtilities.isComputedProperty(newProperty);
    });

    it('should transform property references', () => {
      const testClass = testUtilities.createClass(`
        class TestClass {
          property: string = '';
  
          public getProperty() {
            return this.property;
          }
        }
      `);

      transformMemberReferences(testClass.getMember('property') as PropertyDeclaration, newProperty);
      expect(testClass.getMember('getProperty')).itsBodyMatchesTypescriptCode(
        `return this${isComputedProperty ? '' : '.'}${newProperty};`,
      );
    });

    it('should transform method references', () => {
      const testClass = testUtilities.createClass(`
        class TestClass {
          method() {}
  
          public callMethod() {
            return this.method();
          }
        }
      `);

      transformMemberReferences(testClass.getMember('method') as MethodDeclaration, newProperty);
      expect(testClass.getMember('callMethod')).itsBodyMatchesTypescriptCode(
        `return this${isComputedProperty ? '' : '.'}${newProperty}();`,
      );
    });

    it('should transform property references when the property is an object', () => {
      const testClass = testUtilities.createClass(`
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
      expect(testClass.getMember('getNestedProperty')).itsBodyMatchesTypescriptCode(
        `return this${isComputedProperty ? '' : '.'}${newProperty}.nested;`,
      );
    });
  });
});
