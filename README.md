### Sass-Migrator Loader

This is a webpack (^4.0.0 || ^5.0.0) loader alternative to cli [sass-migrator](https://sass-lang.com/documentation/cli/migrator) ([NPM](https://www.npmjs.com/package/sass-migrator)) tool.

if you have a lot of sass files and you want to migrate them to the new syntax, you should use cli tool.
However, if you have imports from node_modules then you can use this loader instead.
Loader doesn't modify original files, it just passes updated content to the next loader.

#### Installation
```bash
npm install sass-migrator-loader --save-dev
```

#### Usage
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          {
            loader: 'sass-migrator-loader',
            options: {
              // options here
            },
          },
        ],
      },
    ],
  },
};
```
**Attention!** sass-migrator-loader should be under sass-loader.

#### Options
| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `migrations` | `string[]` | `['division']` | list of [migrations](https://sass-lang.com/documentation/cli/migrator#migrations) to apply, you can remove irrelevant once for better performance |
| `flags` | `string[]` | `[]` | list of [flags](https://sass-lang.com/documentation/cli/migrator#global-options) to apply |
| `nodeModulesPrefix` | `string` | `~` | prefix for node_modules imports |
| `srcPrefix` | `string` | `''` | prefix for node_modules imports |


