import { OptionalKind, SourceFile, StructureKind, VariableDeclarationKind, VariableStatementStructure } from 'ts-morph';

export class SymbolInjector {
  static symbolSpecialIdentifier = 'ᛰ';

  static createSymbolName(parentClassName: string, memberName: string): string {
    return `${this.symbolSpecialIdentifier}${parentClassName}${this.symbolSpecialIdentifier}${memberName}${this.symbolSpecialIdentifier}`;
  }

  static createSymbolDeclaration(variableIdentifier: string): OptionalKind<VariableStatementStructure> {
    return {
      kind: StructureKind.VariableStatement,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: variableIdentifier,
          initializer: `Symbol('${variableIdentifier}')`,
        },
      ],
    };
  }

  constructor(private sourceFile: SourceFile) {}

  insertSymbols(position: number, symbolNames: Iterable<string>): void {
    for (const symbolName of symbolNames) {
      const symbolDeclaration = SymbolInjector.createSymbolDeclaration(symbolName);
      this.sourceFile.insertVariableStatement(position, symbolDeclaration);
    }
  }
}
