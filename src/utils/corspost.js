
var ajax = require('../utils/ajax');


function CorsPost(){
	this.doPost = null;
}
CorsPost.prototype = {
	iframeEl: null,
	formEl:null,
	messenger: null,
	callbacks: {
		success: null,
		error: null
	},
	isCorsSupport: 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest(),
	init: function(){
		var self = this;
		if (isCorsSupport) {
			this.doPost = this.ajaxPost;
		} else {
			this.doPost = this.iframePost;
			Dom.ready(function(){
				self.initIframe();
				self.initForm();
				self.initMessenger();
			});
		}
	},
	initMessenger: function(){
		this.messenger = new Messenger('Parent', 'vip_secure_code');
		this.messenger.listen(function(res){
			try{
				res = JSON.parse(res);
				if (res && res.code === 200) {
					self.callbacks.success && self.callbacks.success(res);
				} else {
					self.callbacks.error && self.callbacks.error(res);
				}
			}catch(e){
				self.callbacks.error && self.callbacks.error(e);
			}
		});
		this.messenger.addTarget(this.iframeEl, this.iframeEl.id);
	},

	initIframe: function(){
		var el = document.createElement('iframe');
		var id = jsUtil.id('vsc');
		el.setAttribute('id', id);
		el.setAttribute('name', id);
		el.style.display = 'none';
		el.style.frameborder = 'none';
		el.style.width = '1px';
		el.style.height = '1px';
		document.body.appendChild(el);
		this.iframeEl = el;
	},
	initForm: function(){
		var el = document.createElement('form');
		var id = jsUtil.id('vsc');
		el.setAttribute('id', id);
		el.setAttribute('name', id);
		el.style.display = 'none';
		el.style.frameborder = 'none';
		el.style.width = '1px';
		el.style.height = '1px';
		el.setAttribute('target', this.iframeEl.id);
		el.setAttribute('method', 'post');
		document.body.appendChild(el);
		this.formEl = el;
	},
	ajaxPost: function(o){
		return ajax(o);
	},
	iframePost: function(o){
		this.formEl.setAttribute('action', o.url);
		this.callbacks.success = o.success;
		this.callbacks.error = o.error;
		this.formEl.innerHTML = this.createInputField(o.data);
		this.formEl.submit();
	},
	createInputField: function(data){
		var str = '';
		var template = '<input type="hidden" name="{{NAME}}" value="{{VALUE}} />';
		if(data) {
			for (var p in data) {
				str += template.replace('{{NAME}}', p).replace('{{VALUE}}', data[p]);
			}
		}
		return str;
	}
}
module.exports = CorsPost;