const path = require('path');

// const sassOptions = {
//     importers: [
//         {
//             canonicalize(url) {
//                 if (!url.startsWith('bgcolor:')) return null;
//                 return new URL(url);
//             },
//             load(canonicalUrl) {
//                 return {
//                     contents: `body {background-color: ${canonicalUrl.pathname}}`,
//                     syntax: 'scss',
//                 };
//             },
//         },
//     ],
// };

module.exports = {
    mode: 'development',
    entry: './src/index.jsx',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                    {
                        loader: 'sass-migrator-loader', //path.resolve(__dirname, '../src/index.js'),
                        options: {
                            migrations: [
                                'division', // Use the math.div() function instead of the / division operator
                                'media-logic', // Migrates deprecated `@media` query syntax.\nSee https://sass-lang.com/d/media-logic.
                                'module', // Use the new module system.
                                'namespace', // Change namespaces for `@use` rules.
                                'strict-unary' // Migrates deprecated `$a -$b` syntax (and similar) to unambiguous `$a - $b`
                            ],
                            flags: []
                        }
                    }
                ],
            }
        ],
    }
};


