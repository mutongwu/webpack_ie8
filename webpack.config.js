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
			},
			compress: {
				screw_ie8: false,
			},
			output: {
				screw_ie8: false
			}
		})
	);
}
module.exports = {
	entry: {
		imgwap:['./src/entry/img_wap.js'],
		vsc: ['./src/entry/vsc.js']
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: isProduction ? '/dist/' : '/'
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
        	},{
            	test: /\.html$/,
            	loader: `html-loader?minimize=${isProduction}`
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
	    // host: '0.0.0.0',
	    host: '192.168.32.252',
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