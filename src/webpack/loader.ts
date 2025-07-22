import { LoaderDefinitionFunction } from 'webpack';
import { MakeTypescriptPrivacyBetterOptions } from './options';
import { MakeTypescriptPrivacyBetter } from '../plugin';

const loader: LoaderDefinitionFunction = function (source) {
  const options = new MakeTypescriptPrivacyBetterOptions(this.getOptions());
  const callback = this.async();
  const resourcePath = this.resourcePath;

  const transformedSource = new MakeTypescriptPrivacyBetter().transform(resourcePath, source);
  callback(null, transformedSource);
};

export default loader;
