const path = require("path");
const fs = require('fs');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const srcDir = path.resolve(__dirname, 'src');
const jsDir = path.resolve(srcDir, 'js');

const entries = fs.readdirSync(jsDir)
  .filter(file => /^sketch\d+\.js$/.test(file))
  .reduce((acc, curr) => {
    const name = path.basename(curr, '.js');
    acc[name] = path.join(jsDir, curr);
    return acc;
  }, {});
entries['index'] = path.resolve(srcDir, 'index.js');

const htmlPlugins = Object.keys(entries).map(name => new HtmlWebpackPlugin({
  filename: `${name === 'index' ? 'index' : name}.html`,
  template: path.join(srcDir, `${name === 'index' ? 'index' : name}.html`),
  chunks: [name],
  inject: "body",
  alwaysWriteToDisk: true,
}));

console.log(entries, htmlPlugins)

module.exports = {
  context: path.join(__dirname, "src"),
  entry: entries,
  output: {
    filename: '[name].bundle.js',
    path: __dirname + '/dist'
  },
  target: ["web", "es5"],
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },

  module: {
    rules: [
      {
        test: /\.(sass|scss|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false,
            },
          },
          {
            loader: "css-loader",
            options: {
              url: true,
              importLoaders: 2,
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
      {
        test: /\.(gif|png|jpg|svg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 100 * 1024,
          },
        },
      },
    ],
  },

  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },

  plugins: [
    ...htmlPlugins,
    new MiniCssExtractPlugin({
      filename: "css/style.css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, "src", "img"),
          to: path.join(__dirname, "dist", "img"),
        },
      ],
    }),
    new HtmlWebpackHarddiskPlugin(),
  ],
};
