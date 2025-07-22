import { ClassDeclaration, ConstructorDeclaration, Scope, SyntaxKind } from 'ts-morph';
import { SymbolInjector } from './symbol-injector';
import { TransformationResult } from './transformation-result';
import { NestedKeyMap } from './nested-key-map';
import { transformMemberReferences } from './transform-member-references';

export class ConstructorTransformer {
  public replacementMap = new NestedKeyMap<[string, string], string>();

  transform(classDeclaration: ClassDeclaration, declaration: ConstructorDeclaration): TransformationResult {
    const parentClassName = classDeclaration.getName() ?? 'AnonymousClass';

    for (const param of declaration.getParameters()) {
      if (!param.hasModifier(SyntaxKind.PrivateKeyword)) {
        continue;
      }

      if (this.replacementMap.has([parentClassName, param.getName()])) {
        return TransformationResult.Skipped;
      }

      const symbolName = SymbolInjector.createSymbolName(parentClassName, param.getName());
      const newMemberName = `[${symbolName}]`;

      transformMemberReferences(param, newMemberName);

      param.toggleModifier('private');

      classDeclaration.addProperty({
        name: newMemberName,
        type: param.getType().getText(),
        scope: Scope.Private,
      });
      this.replacementMap.set([parentClassName, param.getName()], symbolName);
      declaration.setBodyText((writer) => {
        writer.write(declaration.getBodyText() ?? '');
        writer.writeLine(`this${newMemberName} = ${param.getName()};`);
      });
      return TransformationResult.Modified;
    }

    return TransformationResult.Finished;
  }
}
