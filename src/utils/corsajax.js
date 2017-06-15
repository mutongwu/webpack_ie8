
// var ajax = require('../utils/ajax');
var jsUtil = require('./jsUtil');
var Dom = require('../lib/dom');
var Messenger = require('../lib/messenger');

function CorsAjax(o){
	this.doAjax = null;
	this.config = jsUtil.extend({
		JSON: o.JSON,
		ajax: o.ajax,
		src: 'http://captcha.api.vip.com:5000/dist/proxy.html',
		xhr2: false //如果浏览器支持，优先使用 XHR2
	}, o);
	this.init();
}
CorsAjax.prototype = {
	iframeEl: null,
	messenger: null,
	callbacks: {
		success: null,
		error: null
	},
	IFRAME_NAME: 'vsc_cors_iframe', // 与 proxy.html 里面的值对应
	PARENT_NAME: 'vsc_cors_parent', // 与 proxy.html 里面的值对应
	NAME_PREFIX: 'vip_secure_code', // 与 proxy.html 里面的值对应

	isCorsSupport: 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest(),
	init: function(){
		var self = this;
		if (this.isCorsSupport && this.config.xhr2) {
			this.doAjax = this.xhr2Ajax
		} else {
			this.doAjax = this.iframeAjax;
			Dom.ready(function(){
				self.initIframe();
				self.initMessenger();
			});
		}
	},
	initMessenger: function(){
		var self = this;
		this.messenger = new Messenger(this.PARENT_NAME, this.NAME_PREFIX);
		this.messenger.listen(function(res){
			try{
				res = self.config.JSON.parse(res);
				self.callbacks.always && self.callbacks.always(res);
				if (res && res.code === 200) {
					self.callbacks.success && self.callbacks.success(res);
				} else {
					self.callbacks.error && self.callbacks.error(res);
				}
			}catch(e){
				self.callbacks.error && self.callbacks.error([e, res].join(','));
			}
		});
		this.messenger.addTarget(this.iframeEl.contentWindow, this.iframeEl.id);
	},

	initIframe: function(){
		var el = document.createElement('iframe');
		var id = this.IFRAME_NAME;//jsUtil.id('vsc');
		el.setAttribute('id', id);
		el.setAttribute('name', id);
		el.setAttribute('src', this.config.src);
		el.style.display = 'none';
		el.style.frameborder = 'none';
		el.style.width = '1px';
		el.style.height = '1px';
		document.body.appendChild(el);
		this.iframeEl = el;
	},
	xhr2Ajax: function(o){
		return this.config.ajax(o);
	},
	iframeAjax: function(o){
		var msg = {
			url: o.url,
			method: o.method || 'get',
			data: o.data
		};
		
		this.callbacks.success = o.success;
		this.callbacks.error = o.error;
		this.callbacks.always = o.always;
		this.messenger.targets[this.iframeEl.id].send(this.config.JSON.stringify(msg));
	}
}
module.exports = CorsAjax;