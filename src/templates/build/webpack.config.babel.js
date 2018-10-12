import { resolve } from 'path';
import { DefinePlugin, EnvironmentPlugin, IgnorePlugin, optimize } from 'webpack';
import WXAppWebpackPlugin, { Targets } from 'wxapp-webpack-plugin';
import StylelintPlugin from 'stylelint-webpack-plugin';
import MinifyPlugin from 'babel-minify-webpack-plugin';
import TSLintPlugin from 'tslint-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import SpeedMeasurePlugin from "speed-measure-webpack-plugin";
import HappyPack from 'happypack';
const paths = require('./paths')
const smp = new SpeedMeasurePlugin();
const {
	NODE_ENV,
	LINT
} = process.env;
const isDev = NODE_ENV !== 'production';
const shouldLint = !!LINT && LINT !== 'false';

const copyPatterns = []
	.concat(paths.projectPackageJson.copyWebpack || [])
	.map(
		(pattern) =>
			typeof pattern === 'string' ? {
				from: pattern,
				to: pattern
			} : pattern,
	);

const relativeFileLoader = (ext = '[ext]') => {
	return {
		loader: 'file-loader',
		options: {
			useRelativePath: true,
			name: `[name].${ext}`,
			context: paths.appSrc,
		},
	};
};

export default (env = {}) => {
	const min = env.min;
	const target = 'Wechat';

	return smp.wrap({
		// point to project root dir
		context: paths.app,
		// for wxapp webpack plugin, recognize program type
		target: Targets[target],
		entry: {
			app: ['./src/app.ts']
		},
		output: {
			filename: '[name].js',
			publicPath: '/',
			path: paths.appBuild,
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					include: /src/,
					exclude: /node_modules/,
					use: [
						'babel-loader',
						shouldLint && 'eslint-loader'
					].filter(Boolean),
				},
				{
					test: /\.tsx?$/,
					enforce: 'pre',
					exclude: /node_modules/,
					use: [{
						loader: 'tslint-loader',
						options: {
							// automatically fix linting errors
							fix: true,
							// enables type checked rules like 'for-in-array' uses tsconfig.json from current working directory
							typeCheck: true
						}
					}]
				},
				{
					test: /\.tsx?$/,
					include: /src/,
					exclude: /node_modules/,
					loader: 'happypack/loader?id=ts'
					// use: [
					// 	// https://github.com/TypeStrong/ts-loader/blob/master/examples/thread-loader/webpack.config.js
					// 	{ loader: 'cache-loader' },
					// 	{
					// 		loader: 'thread-loader',
					// 		options: {
					// 			// there should be 1 cpu for the fork-ts-checker-webpack-plugin
					// 			workers: require('os').cpus().length - 1,
					// 		},
					// 	},
					// 	{
					// 		loader: 'ts-loader',
					// 		options: {
					// 			// IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
					// 			// This implicitly sets *transpileOnly* to true
					// 			// It's advisable to use transpileOnly alongside the [fork-ts-checker-webpack-plugin] to get full type checking again.
					// 			happyPackMode: NODE_ENV !== 'production'
					// 		}
					// 	}
					// ]
				},
				{
					test: /\.(scss|wxss)$/,
					include: /src/,
					use: [
						relativeFileLoader('wxss'),
						{ loader: 'postcss-loader' },
						{ loader: 'sass-loader' },
					],
				},
				{
					test: /\.(json|png|jpg|gif|mp3|wxs)$/,
					include: /src/,
					use: relativeFileLoader()
				},
				{
					test: /\.(wxml|html)$/,
					include: /src/,
					use: [
						relativeFileLoader('wxml'),
						{
							loader: 'wxml-loader',
							options: {
								root: paths.appSrc,
								enforceRelativePath: true
							},
						},
					],
				},
			],
		},
		plugins: [
			new HappyPack({
				id: 'ts',
				threads: 2,
				loaders: [
					{
						path: 'ts-loader',
						query: { happyPackMode: true }
					}
				]
			}),
			new EnvironmentPlugin({
				NODE_ENV: 'development',
			}),
			new FriendlyErrorsWebpackPlugin(),
			new DefinePlugin({
				__DEV__: isDev
			}),
			new WXAppWebpackPlugin({
				clear: !isDev,
				extensions: ['.ts', '.js']
			}),
			new optimize.ModuleConcatenationPlugin(),
			new IgnorePlugin(/vertx/),
			shouldLint && new StylelintPlugin(),
			min && new MinifyPlugin(),
			new CopyPlugin(copyPatterns, {
				context: paths.appSrc
			}),
			// This project differs from tslint-loader in that it will lint all specified files instead of only those that are imported by webpack.
			// This is especially useful for interface files that are not always picked up by webpack (due to treeshaking or whatever).
			new TSLintPlugin({
				files: [resolve(paths.appSrc, '**/*.ts')]
			}),
			// https://github.com/TypeStrong/ts-loader/blob/master/examples/fork-ts-checker/webpack.config.js
			new ForkTsCheckerWebpackPlugin({
				// If true, uses path.resolve(compiler.options.context, './tslint.json'). Default: undefined.
				tslint: true,
				// async: false can block webpack's emit to wait for type checker/linter and to add errors to the webpack's compilation.
				// We recommend to set this to false in projects where type checking is faster than webpack's build - it's better for integration with other plugins. 
				async: false,
				// If you are using this plugin alongside HappyPack or thread-loader then ensure you set the [checkSyntacticErrors] option true
				checkSyntacticErrors: true,
				// optional but improves performance (fewer stat calls)
				watch: [paths.appSrc]
			}),
		].filter(Boolean),
		devtool: isDev ? 'source-map' : false,
		resolve: {
			modules: [paths.appSrc, 'node_modules'],
			extensions: ['.ts', '.js'],
			alias: {
				'@': paths.appSrc,
				'style$': resolve(paths.appSrc, 'style/index.scss')
			},
			// plugins: [
			// 	new TsconfigPathsPlugin({
			// 		configFile: './tsconfig.json'
			// 	})
			// ]
		},
		watchOptions: {
			ignored: /dist|manifest/,
			aggregateTimeout: 300,
		},
		// stats: {
		// 	warningsFilter: /export .* was not found in/
		// }
	});
};
