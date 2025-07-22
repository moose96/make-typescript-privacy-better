import { ClassMemberTypes, ClassStaticBlockDeclaration, ConstructorDeclaration, ParameterDeclaration } from 'ts-morph';

export function transformMemberReferences(
  member: Exclude<ClassMemberTypes, ClassStaticBlockDeclaration | ConstructorDeclaration> | ParameterDeclaration,
  newName: string,
) {
  const references = member.findReferencesAsNodes();

  for (const node of references) {
    const parent = node.getParent();
    parent?.replaceWithText(`this${isComputedProperty(newName) ? '' : '.'}${newName}`);
  }
}

const isComputedProperty = (name: string) => {
  return name.startsWith('[') && name.endsWith(']');
};
