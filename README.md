# Make TypeScript Privacy Better

Class members marked as `private` in TypeScript remain private only until you compile the code to JavaScript.
During compilation, TypeScript simply removes the `private` modifier, making these members accessible at JavaScript runtime.
This tool changes this behavior by converting private member names to unique symbols even before TypeScript begins compilation.
Access to such members is only possible through their corresponding symbols, which remain available only to the declaring class.
This ensures true runtime privacy in JavaScript.

## How It Works

**Before transformation:**
```typescript
class UserService {
  private users: User[] = [];
  private nextId: number = 1;

  private logOperation(message: string): void {
    console.log(message);
  }

  addUser(user: User) {
    this.users.push(user);
    this.logOperation('Added user');
  }
}
```

**After transformation:**
```typescript
const ᛰUserServiceᛰusersᛰ = Symbol('ᛰUserServiceᛰusersᛰ');
const ᛰUserServiceᛰnextIdᛰ = Symbol('ᛰUserServiceᛰnextIdᛰ');
const ᛰUserServiceᛰlogOperationᛰ = Symbol('ᛰUserServiceᛰlogOperationᛰ');

class UserService {
  private [ᛰUserServiceᛰusersᛰ]: User[] = [];
  private [ᛰUserServiceᛰnextIdᛰ]: number = 1;

  [ᛰUserServiceᛰlogOperationᛰ](message: string): void {
    console.log(message);
  }

  addUser(user: User) {
    this[ᛰUserServiceᛰusersᛰ].push(user);
    this[ᛰUserServiceᛰlogOperationᛰ]('Added user');
  }
}
```

## Installation

```sh
npm i -D make-typescript-privacy-better
yarn add -D make-typescript-privacy-better
pnpm add -D make-typescript-privacy-better
```

## Project Configuration

The package provides webpack integration (example below shows configuration for `example.ts` file located in the `src/tests` directory):
```js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/tests/example.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader', 'make-typescript-privacy-better/webpack'], // use before ts-loader
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};
```

## ✨ Features

- [x] Symbol transformation of private class members:
    - [x] Properties
    - [x] Methods
    - [x] Getters and setters
    - [x] Static members
    - [x] Constructor declarations
- [x] Automatic detection and replacement of private member usage with generated symbols
- [x] Generated symbol names don't collide with user-defined symbols (thanks to the unique `ᛰ` character that cannot be typed on a keyboard)
- [x] Full TypeScript compatibility
- [x] Bundler integration:
    - [x] Webpack
    - [ ] Rollup
    - [ ] Vite
    - [ ] esbuild
    - [ ] tsc
- [ ] Ability to override `tsconfig.json` for transformation

## Contributing

### Architecture

- **MakeTypescriptPrivacyBetter** — Main class responsible for TypeScript code transformation
- **Bundle loaders** — Loaders that integrate transformation with bundlers (currently only Webpack)
- **Integration tests** — Usage examples and transformation functionality tests
- **build.mjs** — Build script for the plugin, loaders, and entire package bundling. Uses `esbuild`.

### Project Structure

```
make-typescript-privacy-better/
├── scripts/
    ├── build.mjs                # Package build script. Add build scripts for additional loaders here
├── src/
│   ├── plugin/                  # Main TypeScript code transformation logic
│   │   ├── make-typescript-privacy-better.ts # Main TypeScript transformation class
│   ├── tests/                   # Usage examples and integration test files
│   ├── webpack/                 # Webpack integration
│   │   ├── dist/                # Output directory for webpack integration tests
│   │   ├── loader.ts            # Main Webpack loader file
│   │   ├── options.ts           # Webpack configuration options
│   │   ├── webpack.config.ts    # Webpack configuration for integration tests
├── dist/                        # Output directory
├── ...                          # (other standard files from node-based projects)
```

### How It Works

1. **Loader** — Intercepts `.ts` files and passes them for transformation.
2. **Transformation** — `MakeTypescriptPrivacyBetter` begins transforming the `.ts` file:
    1. Finds all private class members, excluding constructors and skipping `static block declarations`.
    2. Creates a unique symbol based on class name and member name. For anonymous classes, `AnonymousClass` is used as the class name.
    3. Replaces all private member occurrences with generated symbols - `this.member` becomes `this[ᛰClassᛰmemberᛰ]`.
    4. Replaces the private member declaration (from `private member: Type;` to `private [ᛰClassᛰmemberᛰ]: Type;`).
    5. Analyzes the constructor:
        1. Finds all private member declarations in constructor parameters (`constructor(private member: Type) {}`).
        2. Creates a symbol based on class name and member name.
        3. Replaces all private member occurrences with generated symbols - `this.member` becomes `this[ᛰClassᛰmemberᛰ]`.
        4. Removes the `private` modifier from constructor parameter declarations.
        5. Adds a private member declaration with the generated symbol (`private [ᛰClassᛰmemberᛰ]: Type;`) to the class.
        6. Adds an initialization line in the constructor body (`this[ᛰClassᛰmemberᛰ] = member;`).
    6. Repeats these steps for all classes in the file.
3. Returns the transformed code to the **Loader**, which continues processing the file.
