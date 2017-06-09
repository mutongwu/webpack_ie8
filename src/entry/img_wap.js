// require('../lib/es5-shim-lite');

var styleStr = require('../css/wap.styl').toString();
var cssUtil = require('../utils/cssUtil');

var html = require('./img_wap.html');


// require VipSecureCode.js
var jsUtil = VipSecureCode.jsUtil;
var ajax = VipSecureCode.ajax;
var JSON = VipSecureCode.JSON;
var Dom = VipSecureCode.Dom;
var Messenger = VipSecureCode.Messenger;


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

				self.initMessenger();
				self.initForm();
			});
		}
	},
	initMessenger: function(){
		this.messenger = new Messenger('Parent', 'vip_secure_code');
		messenger.listen(function(res){
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
function ImageSecureCode(o){
	var defaultCfg = {
		id: jsUtil.id(),
		exCls: '',
		// required
		params:{
			v: 1,
			challengeId: 'xxxx',
			captchaType: 2,
			data: {}
		},
		onKeyUp:null,
		onShow: null,
		onHide: null,
		onCancel: null,
		onOk: null,
		onClose: null,
		onBeforeShow: null
	};
	this.config = {
		// 所有交互的元素
		elements: null,
		// 组件根节点元素
		contextEl: null
	};
	jsUtil.extend(this.config, defaultCfg);
	jsUtil.extend(this.config, o);
	this.init();
}
ImageSecureCode.prototype = {
	GET_API: 'https://captcha.api.vip.com/api/get',
	CHECK_API: 'https://captcha.api.vip.com/api/check',
	generateDomId: function(){
		return 	{
			INPUT: jsUtil.id('vsc'),
			REFRESH: jsUtil.id('vsc'),
			REFRESH_ICON: jsUtil.id('vsc'),
			IMG: jsUtil.id('vsc'),
			MSG: jsUtil.id('vsc'),
			CANCEL: jsUtil.id('vsc'),
			OK: jsUtil.id('vsc')
		};
	},
	init: function(){
		this.initData();
		this.initDom();
	},
	initData: function(){
		this.queryData = {};
		jsUtil.extend(this.queryData, this.config.params);
		this.queryData.data = JSON.stringify(this.queryData.data);
	},
	initDom: function(){
		var self = this;
		var idMap = this.generateDomId();
		Dom.ready(function(argument) {
			cssUtil.loadStyleStr(styleStr);
			var el = document.createElement('div');
			html = Dom.template(html, idMap);
			html = Dom.template(html, self.config);

			el.innerHTML = html;
			document.body.appendChild(el);

			// 索引元素
			self.setEls(el, idMap);

			// 事件初始化
			self.bindEvent();
		});
	},
	bindEvent: function(){
		var self = this;
		Dom.onKeyUp(this.config.elements['INPUT'], function(event) {
			var target = event.target;
			var val = target.value;
			self.marsData(target, event);
		});
		Dom.onFocus(this.config.elements['INPUT'], function(event) {
			var target = event.target;
			var val = target.value;
			self.marsData(target, event);
		});
		// Dom.onClick(this.config.elements['IMG'], function(event) {
		// 	var target = event.target;
		// 	if (target.getAttribute('loading')) {
		// 		return;
		// 	}
		// 	target.setAttribute('loading', true);
		// 	self.reloadImage().always(function(){
		// 		target.removeAttribute('loading')
		// 	});
		// 	self.marsData(target, event);
		// });
		Dom.onClick(this.config.elements['REFRESH'], function(event) {
			var target = event.target;
			if (target.getAttribute('loading')) {
				return;
			}
			target.setAttribute('loading', true);
			self.reloadImage().always(function(){
				target.removeAttribute('loading')
			});
			self.marsData(target, event);
		});
		Dom.onClick(this.config.elements['CANCEL'], function(event) {
			var target = event.target;
			self.close('CANCEL');
			self.config.onCancel && self.config.onCancel();
			self.marsData(target, event);
		});		
		Dom.onClick(this.config.elements['OK'], function(event) {
			var target = event.target;
			self.checkCode(self.config.elements['INPUT'].value);
			self.marsData(target, event);
		});								
	},
	setEls: function(contextEl, idMap){
		this.config.contextEl = contextEl;
		for(var id in idMap) {
			this.config.elements[id] = document.getElementById(id);
		}
	},
	marsData: function(el, ev) {
		console.log(el, ev);
	},
	unbindEvent: function () {
		var els = this.config.elements;
		for(var id in els) {
			// 删除所有可能的事件绑定
			Dom.removeListener(els[id], Dom.Event.ON_KEYUP);
			Dom.removeListener(els[id], Dom.Event.ON_FOCUS);
			Dom.removeListener(els[id], Dom.Event.ON_CLICK);
		}
	},
	showMsg: function(str){
		var msgEl = self.config.elements['MSG'];
		msgEl.innerHTML = msg;
		Dom.addClass(msgEl, 'vipsc_show');
	},
	hideMsg: function(){
		var msgEl = self.config.elements['MSG'];
		msgEl.innerHTML = '';
		Dom.removeClass(msgEl, 'vipsc_show');
	},
	// 校验图片
	checkCode: function(code){

	},
	reloadImage: function() {
		var self = this;
		return ajax({
			url: this.GET_API,
			data: this.queryData,
			dataType: 'jsonp',
			success: function(res){
				if (res && res.code === 200 && res.data) {
					self.config.elements['IMG'].src = res.data;
				} else {
					self.showMsg(res.msg)
				}
			},
			error: function(res){
				self.showMsg(res && res.msg)
			}
		});
	},
	close: function(type){
		this.config.onClose && this.config.onClose.call(this, type);
	},
	destroy: function(){
		this.unbindEvent();
		for(var id in this.config.elements) {
			this.config.elements[id] = null;
		}
	},
	validate: function(){

	},
	show: function(){
		Dom.addClass(this.config.contextEl, 'vipsc_show');
		this.config.onShow && this.config.onShow();
		return this;
	}

};
function Wrapper(o){
	this.instance = null;
	if (this instanceof Wrapper) {
		this.instance = new ImageSecureCode(o);
		return this;
	} else {
		return new Wrapper(o);
	}
}
Wrapper.prototype = {
	constructor: Wrapper,

	destroy: function(){
		this.instance.destroy();
	},
	validate: function(){
		return this.instance.validate();
	},
	show: function(){
		return this.instance.show();
	}
};
module.exports = Wrapper;

// var validateObj = new Wrapper();
// function VipSecureCode(cfg){
// 	var defaultCfg = {
// 		vType: 'image', // image/slider
// 		uxType: 'inline', // inline/modal
// 		data:{},


// 	};
// 	this.init(cfg)
// }
// VipSecureCode.prototype = {
// 	init: function(cfg){
// 		if (this.config.vType === 'image') {

// 		} else if (this.config.vType === 'slider') {

// 		} else {
// 			console.error('invalid vType:' + this.config.vType);
// 		}
// 	}
// };
// {
// 	load: function(){
// 		return this;
// 	},
// 	createInstance: function(){

// 	}
// }
// function VipSecureCodeLoader(){
// 	function loaderFn(){

// 	}
// 	return new loaderFn();
// }

// var aLoader = VipSecureCodeLoader();
// var scriptEl = aLoader.load({
// 	url: '',
// 	data:{

// 	},
// 	success: null,
// 	error: null,
// 	timeout: 6000,
// }).then(function(VipSecureCode){
// 	var instance = VipSecureCode.create({
// 		id: 'J_div',
// 		data: {},
// 		options:{
// 		}
// 	});
// 	// instance.destroy();
// 	// instance.destroy();

// 	var result = instance.validate();

	
// }, function(){})