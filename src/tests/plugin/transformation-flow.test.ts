import { describe, it, beforeEach, expect } from 'vitest';
import { SourceFileTransformer } from '../../plugin/source-file-transformer';
import { ConstructorTransformer } from '../../plugin/constructor-transformer';
import { ClassDeclaration, SourceFile } from 'ts-morph';
import { TestUtilities, testUtilities } from './utility/test-utilities';
import { TransformationResult } from '../../plugin/transformation-result';
import { SymbolInjector } from '../../plugin/symbol-injector';

describe('the flow of the transformation methods', () => {
  let sourceFileTransformer: SourceFileTransformer;
  let constructorTransformer: ConstructorTransformer;
  let sourceFile: SourceFile;

  beforeEach(() => {
    sourceFileTransformer = new SourceFileTransformer();
    constructorTransformer = new ConstructorTransformer();

    sourceFile = testUtilities.createFile(`
      class FirstTestClass {
        constructor(private first: string, private second: string) {}
      
        private privateMethod() {}
        private privateProperty: string;
        private ${SymbolInjector.symbolSpecialIdentifier}: string;
      }
      
      class SecondTestClass {
        private privateMethod() {}
      }
    `);
  });

  describe('when transforming a member', () => {
    it('should return "Modified" when an entity has been transformed', () => {
      const members = testUtilities.fetchClass(sourceFile, 'FirstTestClass').fetchMembers().currentMembers!;

      expect(sourceFileTransformer.transformMember('FirstTestClass', members[1] as any)).toBe(
        TransformationResult.Modified,
      );
    });

    it('should return "Skipped" when an entity has been already transformed', () => {
      let members = testUtilities.fetchClass(sourceFile, 'FirstTestClass').fetchMembers().currentMembers!;

      sourceFileTransformer.transformMember('FirstTestClass', members[1] as any);

      members = testUtilities.fetchClass(sourceFile, 'FirstTestClass').fetchMembers().currentMembers!;

      expect(sourceFileTransformer.transformMember('FirstTestClass', members[1] as any)).toBe(
        TransformationResult.Skipped,
      );
    });

    it('should return "Skipped" when an entity\'s name has special identifier', () => {
      const members = testUtilities.fetchClass(sourceFile, 'FirstTestClass').fetchMembers().currentMembers!;
      expect(sourceFileTransformer.transformMember('FirstTestClass', members[3] as any)).toBe(
        TransformationResult.Skipped,
      );
    });
  });

  describe('when transforming a class declaration', () => {
    it('should return "Modified" when its members have been transformed', () => {
      const classDeclaration = testUtilities.fetchClass(sourceFile, 'FirstTestClass').currentClass!;
      expect(sourceFileTransformer.transformClassDeclaration(classDeclaration)).toBe(TransformationResult.Modified);
    });

    it('should return "Finished" when there is nothing to transform', () => {
      let classDeclaration: ClassDeclaration;

      const members = testUtilities.fetchClass(sourceFile, 'FirstTestClass').fetchMembers().currentMembers!;
      const membersLengthWithoutConstructor = members.length - 1;

      let result: TransformationResult;

      for (let i = 0; i < membersLengthWithoutConstructor; i++) {
        classDeclaration = testUtilities.fetchClass(sourceFile, 'FirstTestClass').currentClass!;
        result = sourceFileTransformer.transformClassDeclaration(classDeclaration);
      }

      expect(result!).toBe(TransformationResult.Finished);
    });

    it('should return "Skipped" when it has been already transformed', () => {
      let classDeclaration: ClassDeclaration;

      const members = testUtilities.fetchClass(sourceFile, 'FirstTestClass').fetchMembers().currentMembers!;
      const membersLengthWithoutConstructor = members.length - 1;

      for (let i = 0; i < membersLengthWithoutConstructor; i++) {
        classDeclaration = testUtilities.fetchClass(sourceFile, 'FirstTestClass').currentClass!;
        sourceFileTransformer.transformClassDeclaration(classDeclaration);
      }

      classDeclaration = testUtilities.fetchClass(sourceFile, 'FirstTestClass').currentClass!;
      expect(sourceFileTransformer.transformClassDeclaration(classDeclaration)).toBe(TransformationResult.Skipped);
    });
  });

  describe('when transforming a constructor declaration', () => {
    it('should return "Modified" when its parameters have been transformed', () => {
      const classDeclaration = testUtilities.fetchClass(sourceFile, 'FirstTestClass').currentClass!;
      const constructorDeclaration = TestUtilities.getDefaultConstructor(classDeclaration);

      expect(constructorTransformer.transform(classDeclaration, constructorDeclaration)).toBe(
        TransformationResult.Modified,
      );
    });

    it('should return "Skipped" when it has been already transformed', () => {
      const classDeclaration = testUtilities.fetchClass(sourceFile, 'FirstTestClass').currentClass!;
      const constructorDeclaration = TestUtilities.getDefaultConstructor(classDeclaration);

      // you should never set the replacement map manually. actually, it should be a friend member of the SourceFileTransformer class
      constructorTransformer.replacementMap.set(['FirstTestClass', 'first'], '');

      constructorTransformer.transform(classDeclaration, constructorDeclaration);
      expect(constructorTransformer.transform(classDeclaration, constructorDeclaration)).toBe(
        TransformationResult.Skipped,
      );
    });

    it('should return "Skipped" when the class does not have a constructor declaration', () => {
      const classDeclaration = testUtilities.fetchClass(sourceFile, 'SecondTestClass').currentClass!;
      const constructorDeclaration = TestUtilities.getDefaultConstructor(classDeclaration);

      expect(constructorTransformer.transform(classDeclaration, constructorDeclaration)).toBe(
        TransformationResult.Skipped,
      );
    });

    it('should return "Finished" when there is nothing to transform', () => {
      const classDeclaration = testUtilities.fetchClass(sourceFile, 'FirstTestClass').currentClass!;
      const constructorDeclaration = TestUtilities.getDefaultConstructor(classDeclaration);

      const paramsLength = constructorDeclaration.getParameters().length;

      for (let i = 0; i < paramsLength; i++) {
        constructorTransformer.transform(classDeclaration, constructorDeclaration);
      }

      /* notice different behavior than SourceFileTransformer.transformClassDeclaration */
      expect(constructorTransformer.transform(classDeclaration, constructorDeclaration)).toBe(
        TransformationResult.Finished,
      );
    });
  });
});
