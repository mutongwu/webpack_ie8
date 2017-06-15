var jsUtil = require('./jsUtil');
var Dom = require('../lib/dom');


function placeholder(o){
	this.config = jsUtil.extend({}, {
		el: null,
		holderCls: 'vsc_input_placehoder'
	});
	jsUtil.extend(this.config, o);
	this.init();
}
placeholder.prototype = {
	isPlacehoderSupport: 'placeholder' in document.createElement('input'),
	init: function(){
		if(this.isPlacehoderSupport) {
			return;
		}
		console.log('this.isPlacehoderSupport:' , this.isPlacehoderSupport);
		console.log(this.config.el)
		this.config.holderTxt = Dom.attribute(this.config.el, 'placeholder');
		this.initEvent();
		this.initValue();
	},
	initValue: function(){
		var target = this.config.el;
		if (target.value.replace(/^\s+/,'').replace(/\s+$/,'') === '') {
			Dom.removeClass(this.config.el, this.config.holderCls);
			this.config.el.value = this.config.holderTxt;
		}
	},
	initEvent: function(){
		var self = this;
		var txt = this.config.holderTxt;
		function listener(e){
			var target = e.target;
			if (target.value === txt) {
				Dom.removeClass(self.config.el, self.config.holderCls);
				self.config.el.value = '';
			}
		}
		Dom.onKeyUp(this.config.el, listener);
		Dom.onClick(this.config.el, listener);
		Dom.onFocus(this.config.el, listener);
		Dom.onBlur(this.config.el, function(){
			var val = self.config.el.value.replace(/^\s+/,'').replace(/\s+$/,'');
			if (!val) {
				Dom.addClass(self.config.el, self.config.holderCls);
				self.config.el.value = self.config.holderTxt;
			}
		});
		
	},
	destroy: function(){
		if(this.isPlacehoderSupport) {
			return;
		}
		Dom.removeListener(this.config.el, Dom.Event.ON_KEYUP);
		Dom.removeListener(this.config.el, Dom.Event.ON_FOCUS);
		Dom.removeListener(this.config.el, Dom.Event.ON_CLICK);
		Dom.removeListener(this.config.el, Dom.Event.ON_BLUR);
	}
}
module.exports = placeholder;