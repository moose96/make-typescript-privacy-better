import { Project } from 'ts-morph';
import { SourceFileTransformer } from './source-file-transformer';

export class MakeTypescriptPrivacyBetter {
  private project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: 99, // Latest
      module: 1, // CommonJS
      strict: true,
      allowJs: false,
    },
  });

  private sourceFileTransformer = new SourceFileTransformer();

  transform(resourcePath: string, source: string) {
    const sourceFile = this.project.createSourceFile(resourcePath, source);
    this.sourceFileTransformer.transformSourceFile(sourceFile);

    return sourceFile.getFullText();
  }
}
