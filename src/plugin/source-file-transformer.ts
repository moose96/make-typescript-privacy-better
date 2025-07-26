import {
  ClassDeclaration,
  ClassMemberTypes,
  ClassStaticBlockDeclaration,
  ConstructorDeclaration,
  ParameterDeclaration,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { SymbolInjector } from './symbol-injector';
import { TransformationResult } from './transformation-result';
import { transformMemberReferences } from './transform-member-references';
import { NestedKeyMap } from './nested-key-map';
import { ConstructorTransformer } from './constructor-transformer';

export class SourceFileTransformer {
  private replacementMap = new NestedKeyMap<[string, string], string>();
  private visitedClasses: Set<string> = new Set();
  private constructorTransformer = new ConstructorTransformer();

  transformSourceFile(sourceFile: SourceFile) {
    const symbolInjector = new SymbolInjector(sourceFile);
    let wasModified: boolean;

    do {
      wasModified = false;

      const classes = sourceFile.getClasses();

      for (const classDeclaration of classes) {
        if (
          this.transformClassDeclaration(classDeclaration) === TransformationResult.Modified ||
          this.constructorTransformer.transform(classDeclaration, classDeclaration.getConstructors()[0]) ===
            TransformationResult.Modified
        ) {
          wasModified = true;
          break;
        }

        this.replacementMap.concat(this.constructorTransformer.replacementMap);
      }
    } while (wasModified);

    const classes = sourceFile.getClasses();
    const firstClassDeclaration = classes.at(0);
    const firstClassPosition = Math.max((firstClassDeclaration?.getStartLineNumber() ?? 0) - 3, 0);

    symbolInjector.insertSymbols(firstClassPosition, this.replacementMap.values());
  }

  transformClassDeclaration(classDeclaration: ClassDeclaration): TransformationResult {
    const className = classDeclaration.getName() ?? 'AnonymousClass';

    if (this.visitedClasses.has(className)) {
      return TransformationResult.Skipped;
    }

    const privateMembers = classDeclaration
      .getMembers()
      .filter(
        (member) =>
          !(member instanceof ClassStaticBlockDeclaration) &&
          !(member instanceof ConstructorDeclaration) &&
          member.hasModifier(SyntaxKind.PrivateKeyword),
      ) as Exclude<ClassMemberTypes, ClassStaticBlockDeclaration | ConstructorDeclaration>[];

    for (const member of privateMembers) {
      if (this.transformMember(className, member) === TransformationResult.Modified) {
        return TransformationResult.Modified;
      }
    }

    this.visitedClasses.add(className);
    return TransformationResult.Finished;
  }

  transformMember(
    parentClassName: string,
    member: Exclude<ClassMemberTypes, ClassStaticBlockDeclaration | ConstructorDeclaration> | ParameterDeclaration,
  ): TransformationResult {
    const name = member.getName();

    if (this.replacementMap.has([parentClassName, name]) || name.includes(SymbolInjector.symbolSpecialIdentifier)) {
      return TransformationResult.Skipped;
    }

    const symbolName = SymbolInjector.createSymbolName(parentClassName, name);

    this.replacementMap.set([parentClassName, name], symbolName);

    const newMemberName = `[${symbolName}]`;

    transformMemberReferences(member, newMemberName);
    member.rename(newMemberName);

    return TransformationResult.Modified;
  }
}
