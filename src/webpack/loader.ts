import { LoaderDefinitionFunction } from 'webpack';
import { MakeTypescriptPrivacyBetter } from '../plugin';

const loader: LoaderDefinitionFunction = function (source) {
  const callback = this.async();
  const resourcePath = this.resourcePath;

  const transformedSource = new MakeTypescriptPrivacyBetter().transform(resourcePath, source);
  callback(null, transformedSource);
};

export default loader;
