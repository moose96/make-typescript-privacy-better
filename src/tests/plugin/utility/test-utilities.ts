import { ClassDeclaration, ClassMemberTypes, ConstructorDeclaration, Project, SourceFile } from 'ts-morph';
import { SymbolInjector } from '../../../plugin/symbol-injector';
import { assert } from 'vitest';

export class TestUtilities {
  private project = new Project({
    useInMemoryFileSystem: true,
  });

  static isComputedProperty(name: string): boolean {
    return name.startsWith('[') && name.endsWith(']');
  }

  static getDefaultConstructor(declaration: ClassDeclaration): ConstructorDeclaration {
    return declaration.getConstructors()[0];
  }

  currentClass: ClassDeclaration | undefined;
  currentMembers: ClassMemberTypes[] | undefined;

  createFile(code = '', name = 'mock.ts') {
    return this.project.createSourceFile(name, code, { overwrite: true });
  }

  createClass(code: string) {
    const file = this.createFile(code, '_class.ts');
    return file.getClasses()[0];
  }

  createTransformedSymbolDeclaration(className: string, propertyName: string): string {
    const sourceFile = this.createFile('', '_symbols.ts');
    const symbolInjector = new SymbolInjector(sourceFile);
    symbolInjector.insertSymbols(0, [SymbolInjector.createSymbolName(className, propertyName)]);
    return sourceFile.getText();
  }

  fetchClass(sourceFile: SourceFile, className: string): this {
    this.currentClass = sourceFile.getClass(className);
    assert(this.currentClass, `${className} should exist`);
    return this;
  }

  fetchMembers(): this {
    this.currentMembers = this.currentClass?.getMembers() || [];
    assert(this.currentMembers.length > 0, `${this.currentClass?.getName() ?? 'current class'} should have members`);
    return this;
  }
}

export const testUtilities = new TestUtilities();
