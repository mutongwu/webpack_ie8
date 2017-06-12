require('../lib/es5-shim-lite');

var ajax = require('reqwest');

var messenger = require('../lib/messenger');
var Dom = require('../lib/dom');
var CorsPost = require('../utils/corspost');
var jsUtil = require('../utils/jsUtil');

var vipsc = {
	cache: {

	},
	/**
	* @param obj {Object} js加载
	*/
	load: function(obj) {
		var url = obj.url;
		var params = '';
		var data = obj.data;
		if (this.cache[url]) {
			return this.cache[url];
		}
		if (data && typeof data === 'object') {
			for (var p in data) {
				params += p + '=' + encodeURIComponent(data[p]);
				params += '&';
			}
			params = params.substring(0, params.length - 1);
			url += url.indexOf('?') === -1 ? '?' : '&';
			url += params;
		}
		this.cache[url] =  jsUtil.loadJs(obj.url, obj.success, obj.error, obj.timeout);

		this.initPoster();
		return this.cache[url];
	},
	initPoster: function(){
		this.poster = new CorsPost();
	},
	/**
	* @param o {Object} 配置信息
	* @desc 如果要兼容 IE6/7，必须传递 JSON 的配置信息。
		组件优先使用 'JSON' 配置属性，或者分别传递 parseJSON/stringifyJSON 方法
	*/
	config: function(o){
		if (!window.JSON) {
			this.JSON = o.JSON || {
				stringify: o.stringifyJSON,
				parse: o.parseJSON
			};
		}
		return this;
	},
	JSON: window.JSON,
	jsUtil:jsUtil,
	ajax: ajax,
	Messenger: messenger,
	Dom: Dom,
	CorsPost: CorsPost
};

if (window.VipSecureCode) {
	console.error('VipSecureCode dulplicated.');
}
// export namespace
window.VipSecureCode = vipsc;
