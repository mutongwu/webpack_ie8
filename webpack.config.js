var path = require('path');
var webpack = require('webpack');
var SpritesmithPlugin = require('webpack-spritesmith');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
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
		template: './src/index.ejs',
		chunks:['vsc']
	}),
	new ManifestPlugin()
];
var proxyPlugins = [
	new HtmlWebpackPlugin({
		inlineSource: '.(js|css)$', // embed all javascript and css inline
		filename: 'proxy.html',
		template: './src/proxy.ejs'
	}),
	new HtmlWebpackInlineSourcePlugin()
];
// if (isProduction) {
// 	var uglify = new UglifyJSPlugin({
// 		mangleProperties: {
// 			screw_ie8: false,
// 		},
// 		compress: {
// 			screw_ie8: false,
// 		},
// 		output: {
// 			screw_ie8: false
// 		}
// 	});
// 	plugins.push(uglify);
// 	proxyPlugins.push(uglify);
// }
var baseConfig = {
	entry: {
		// imgwap:['./src/entry/img_wap.js'],
		// imgpc:['./src/entry/img_pc.js'],
		// vsc: ['./src/entry/vsc.js']
	},
	output: {
		filename: '[name].js',
		// filename: '[name].[chunkhash:8].js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: isProduction ? '/dist/' : '/'
	},
	module: {
		loaders: [
		    {
		    	test: /\.styl$/,
		    	loader: `to-string-loader!css-loader?minimize=${isProduction}!postcss-loader!stylus-loader`
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
	  }	
}

var devConfig = Object.assign({}, baseConfig , {
	entry:{
		imginline:['./src/entry/img_inline.js'],
		imgpop:['./src/entry/img_pop.js'],
		vsc: ['./src/entry/vsc.js']
	},
	plugins: plugins
});
var proxyConfig = Object.assign({}, baseConfig, {
	entry:{
		proxy: ['./src/entry/proxy.js']
	},
	plugins: proxyPlugins
});


module.exports = [devConfig, proxyConfig];