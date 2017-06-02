var path = require('path');
var webpack = require('webpack');
var SpritesmithPlugin = require('webpack-spritesmith');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var UglifyJSPlugin  =  webpack.optimize.UglifyJsPlugin;
var nodeEnv = process.env.NODE_ENV || 'development';
var isProduction = nodeEnv === 'production';


var plugins = [
	new SpritesmithPlugin({
        src: {
            cwd: path.resolve(__dirname, 'src/images/icons'),
            glob: '*.png'
        },
        target: {
            image: path.resolve(__dirname, 'src/images/sprite.png'),
            css: path.resolve(__dirname, 'src/css/sprite.styl')
        },
        apiOptions: {
            cssImageRef: "../images/sprite.png"
        }
    }),
	new HtmlWebpackPlugin({
		template: './src/index.ejs'
	})
];

if (isProduction) {
	plugins.push(
		new UglifyJSPlugin({
			mangleProperties: {
				screw_ie8: false,
				//ignore_quoted: true,      // do not mangle quoted properties and object keys
			},
			compress: {
				screw_ie8: false,
				//properties: false // optional: don't convert foo["bar"] to foo.bar
			},
			output: {
				screw_ie8: false
			}
		})
	);
}
module.exports = {
	entry: ['./src/entry/img_wap.js'],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		loaders: [
		    {
		    	test: /\.styl$/,
		    	loader: `css-loader?minimize=${isProduction}!postcss-loader!stylus-loader`
		    },
            {
            	test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            	loader: 'file-loader?name=assets/[hash].[ext]'
        	}
		]
	},
	resolve: {
        modulesDirectories: ["node_modules", "spritesmith-generated"]
    },
	plugins: plugins,
  	devServer: {
	    contentBase: isProduction ? './dist' : './src',
	    historyApiFallback: true,
	    port: 3000,
	    compress: isProduction,
	    inline: !isProduction,
	    // hot: !isProduction,
	    host: '0.0.0.0',
	    stats: {
	      assets: true,
	      children: false,
	      chunks: false,
	      hash: false,
	      modules: false,
	      publicPath: false,
	      timings: true,
	      version: false,
	      warnings: true,
	      colors: {
	        green: '\u001b[32m',
	      },
	    },
	  },
};