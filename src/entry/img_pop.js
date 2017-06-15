/**
*
* 图片验证码——弹窗组件
*
*	示例:
*	var configObject = {
*		url: '../dist/imgwap.js',
*		params: {
*			v: 1,
*			challengeId: 'xxxx',
*			captchaType: 2,
*			data: {}
*		}
*	};	
*	VipSecureCode.init({xhr2:false});

*	// 初始化实例
*	var instance = new VipSecureCode.ImageSecureCode({
*		exCls: 'customeCls',			// 可选，附加样式 class，可以用于自定义调整样式
*		params: configObject.params,	// 必填，验证码接口相关参数
*		onCancel: function(){			// 可选，取消按钮回调函数
*			console.log('cancel click.');
*		},
*		onClose: function(){			// 可选，确认按钮回调函数
*			console.log('modal  closed.');
*		}
*	});
*
*
*	// 显示元素
*	instance.show();
*/

var styleStr = require('../css/img_pop.styl');
var cssUtil = require('../utils/cssUtil');

var html = require('./img_pop.html');


var VipSecureCode = window.VipSecureCode;
var jsUtil = VipSecureCode.jsUtil;
var ajax = VipSecureCode.ajax;
var JSON = VipSecureCode.JSON;
var Dom = VipSecureCode.Dom;
var Messenger = VipSecureCode.Messenger;

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
		success: function(){},
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
		elements: {},
		// 组件根节点元素
		contextEl: null
	};
	jsUtil.extend(this.config, defaultCfg);
	jsUtil.extend(this.config, o);
	this.init();
}
ImageSecureCode.prototype = {
	GET_API: 'http://captcha.api.vip.com:5000/api/get',
	CHECK_API: 'http://captcha.api.vip.com:5000/api/check',
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
			self.reloadImage(function(){
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
			this.config.elements[id] = document.getElementById(idMap[id]);
		}
	},
	marsData: function(el, ev) {
		// console.log(el, ev);
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
		var msgEl = this.config.elements['MSG'];
		msgEl.innerHTML = str;
		Dom.addClass(msgEl, 'vipsc_show');
	},
	hideMsg: function(){
		var msgEl = this.config.elements['MSG'];
		// msgEl.innerHTML = '';
		Dom.removeClass(msgEl, 'vipsc_show');
	},
	// 校验图片
	checkCode: function(code){
		var self = this;
		code = code.replace(/^\s+/,'').replace(/\s+$/,'');
		if (!code){
			this.showMsg('请输入校验码');
			return;
		}
		this.hideMsg();
		VipSecureCode.getPoster().doAjax({
			url: this.CHECK_API,
			data: this.queryData,
			method: 'post',
			withCredentials:true,
			type:'json',
			success: function(res){
				if (res && res.code === 200){
					self.config.success(res.data);
					self.close();
				}
			},
			error: function(res){
				self.showMsg(res && res.msg || '验证失败');
			}
		});
	},
	reloadImage: function(callback) {
		var self = this;
		VipSecureCode.getPoster().doAjax({
			url: this.GET_API,
			data: this.queryData,
			method: 'get',
			success: function(res){
				if (res && res.code === 200 && res.data) {
					self.config.elements['IMG'].src = res.data;
				} else {
					self.showMsg(res.msg)
				}
			},
			error: function(res){
				self.showMsg(res && res.msg)
			},
			always:function(){
				callback && callback();
			}
		});
	},
	close: function(type){
		this.config.onClose && this.config.onClose.call(this, type);
		this.destroy();
		Dom.remove(this.config.contextEl);
	},
	destroy: function(){
		console.log('destroy')
		this.unbindEvent();
		for(var id in this.config.elements) {
			this.config.elements[id] = null;
		}
	},
	validate: function(){

	},
	show: function(){
		Dom.addClass(this.config.contextEl.firstChild, 'vipsc_show');
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

//export 
VipSecureCode.ImageSecureCode = Wrapper;
// module.exports = Wrapper;
