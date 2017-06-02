//@see https://github.com/postcss/postcss-loader
module.exports = ({ file, options, env }) => ({
  plugins: {
  	//@see https://github.com/postcss/autoprefixer
    'autoprefixer': {
    	browserslist: ['android', 'ie >= 9','and_uc']
    },
  }
})