import { describe, expect, it } from 'vitest';
import { SymbolInjector } from '../../plugin/symbol-injector';
import { TypescriptTestUtility } from './typescript-test-utility';

describe('SymbolInjector', () => {
  it('should create a symbol name using special character', () => {
    expect(SymbolInjector.createSymbolName('ParentClass', 'memberName')).toBe('ᛰParentClassᛰmemberNameᛰ');
  });

  it('should create correct symbol declaration', () => {
    expect(SymbolInjector.createSymbolDeclaration('testSymbol')).toMatchTypescriptCode(
      "const testSymbol = Symbol('testSymbol');",
    );
  });

  it('should create many symbol declarations', () => {
    const sourceFile = TypescriptTestUtility.instance.createEmptyFile();
    const symbolInjector = new SymbolInjector(sourceFile);
    symbolInjector.insertSymbols(0, ['symbol1', 'symbol2', 'symbol3']);

    expect(sourceFile).toMatchTypescriptCode(`
      const symbol3 = Symbol('symbol3');
      const symbol2 = Symbol('symbol2');
      const symbol1 = Symbol('symbol1');
    `);
  });
});
