import { beforeEach, describe, expect, it } from 'vitest';
import { SourceFileTransformer } from '../../plugin/source-file-transformer';
import { testUtilities } from './utility/test-utilities';
import { SymbolInjector } from '../../plugin/symbol-injector';

describe('SourceFileTransformer', () => {
  let sourceFileTransformer: SourceFileTransformer;

  beforeEach(() => {
    sourceFileTransformer = new SourceFileTransformer();
  });

  it('should transform source file with one class and imports', () => {
    const sourceFile = testUtilities.createFile(`
      import { SomeClass } from './some-class';
      
      class TestClass {
        private privateMethod() {}
      }
    `);

    sourceFileTransformer.transformSourceFile(sourceFile);

    expect(sourceFile).toMatchTypescriptCode(`
      import { SomeClass } from './some-class';
      
      ${testUtilities.createTransformedSymbolDeclaration('TestClass', 'privateMethod')}
    
      class TestClass {
        private [${SymbolInjector.createSymbolName('TestClass', 'privateMethod')}]() {}
      }
    `);
  });

  it('should transform source file with two classes and imports', () => {
    const sourceFile = testUtilities.createFile(`
      import { SomeClass } from './some-class';
      
      class TestClass {
        private privateMethod() {}
      }
      
      class OtherClass {
        private get privateGetter() {}
      }
    `);

    sourceFileTransformer.transformSourceFile(sourceFile);

    expect(sourceFile).toMatchTypescriptCode(`
      import { SomeClass } from './some-class';
      
      ${testUtilities.createTransformedSymbolDeclaration('OtherClass', 'privateGetter')}
      ${testUtilities.createTransformedSymbolDeclaration('TestClass', 'privateMethod')}
      
      class TestClass {
        private [${SymbolInjector.createSymbolName('TestClass', 'privateMethod')}]() {}
      }
      
      class OtherClass {
        private get [${SymbolInjector.createSymbolName('OtherClass', 'privateGetter')}]() {}
      }
      
    `);
  });
});
