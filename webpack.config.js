var path = require('path');
var webpack = require('webpack');
module.exports = {
    entry: './js/plugins/OnlineSystem/onlineSystem.js',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, './js/plugins'),
        filename: 'OnlineSystem.js',
        libraryTarget: 'var',
        library: 'Plugins'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    stats: {
        colors: true
    },
};