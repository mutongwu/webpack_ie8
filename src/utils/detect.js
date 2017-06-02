'use strict';

var browser, version, mobile, os, bit, isIE6, placeholder;
var ua = window.navigator.userAgent;
var platform = window.navigator.platform;
var elem = document.body || document.documentElement;

var mobile = false;

// 判断是否为 IE 浏览器
if (/MSIE/.test(ua)) {
    browser = 'MSIE';
    //判断是否为移动端IE
    if (/IEMobile/.test(ua)) {
        mobile = true;
    }
    version = /MSIE \d+[.]\d+/.exec(ua)[0].split(' ')[1];
    
}
//IE11判断
else if (navigator.userAgent.match(/Trident.*rv[ :]*11\./)) {
    browser = 'MSIE';
    version = 11;
}
// 判断是否为 Chrome 浏览器
else if (/Chrome/.test(ua)) {
    // Platform override for Chromebooks
    if (/CrOS/.test(ua)) {
        platform = 'CrOS';
    }
    browser = 'Chrome';
    version = /Chrome\/[\d\.]+/.exec(ua)[0].split('/')[1];
    
}
// 判断是否为 Opera 浏览器
else if (/Opera/.test(ua)) {
    browser = 'Opera';
    if (/mini/.test(ua) || /Mobile/.test(ua)) {
        mobile = true;
    }
}
// 判断是否为 Android 设备
else if (/Android/.test(ua)) {
    browser = 'Android Webkit Browser';
    mobile = true;
    os = /Android\s[\.\d]+/.exec(ua)[0];
}
// 判断是否为 Firefox 浏览器
else if (/Firefox/.test(ua)) {
    browser = 'Firefox';
    if (/Fennec/.test(ua)) {
        mobile = true;
    }
    version = /Firefox\/[\.\d]+/.exec(ua)[0].split('/')[1];
}
// 判断是否为 Safari 浏览器
else if (/Safari/.test(ua)) {
    browser = 'Safari';
    if ((/iPhone/.test(ua)) 
        || (/iPad/.test(ua)) 
        || (/iPod/.test(ua))) {
        os = 'iOS';
        mobile = true;
    }
}

// 未知设备
if (!version) {
    version = /Version\/[\.\d]+/.exec(ua);
    if (version) {
        version = version[0].split('/')[1];
    }
    else {
        version = undefined;
    }
}

if (platform === 'MacIntel' 
    || platform === 'MacPPC') {
    os = 'Mac OS X';
}
else if (platform === 'CrOS') {
    os = 'ChromeOS';
}
else if (platform === 'Win32'
    || platform == 'Win64') {
    os = 'Windows';
    bit = platform.replace(/[^0-9]+/,'');
}
else if (!os && /Android/.test(ua)) {
    os = 'Android';
}
else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
}
else if (!os && /Windows/.test(ua)) {
    os = 'Windows';
}

// 特征检测判断是否是移动端
if (!mobile
    && 'createTouch' in document) {
    mobile = true;
}

// 判断是否为IE6
isIE6 = browser == 'MSIE' && version == '6.0';


placeholder = 'placeholder' in document.createElement("input");

//检测浏览器是否支持 transition
var elemStyle = elem.style;
var transitionProperties = ['webkitTransition',
                            'mozTransition',
                            'oTransition',
                            'msTransition',
                            'transition'];
var browserPreList = ['-webkit-', '-moz-', '-o-', '-ms-', ''];
var transition = false;
var transitionEnd = '';
var browserPre = '';

for (var i = 0; i < transitionProperties.length; i++) {
    if (transitionProperties[i] in elemStyle) {
        transition = true;
        transitionEnd = transitionProperties[i] + (i != 4 ? 'End' : 'end');
        browserPre = browserPreList[i];
        break;
    }
}


var Detect = {
    /**
     * 获取ua
     * @property ua 
     * @type String 
     */
    ua : ua,
    /**
     * 获取浏览器类型
     * @property browser 
     * @type String
     * @example 会返回MSIE, Chrome, Opera, Firefox等
     */
    browser : browser,
    /**
     * 获取浏览器版本号
     * @property version 
     * @type String
     */
    version : version,
    /**
     * 判断是否为移动端
     * @property mobile
     * @type Boolean
     */
    mobile : mobile,
    /**
     * 获取用户操作系统
     * @property os
     * @type String
     */
    os : os,
    /**
     * 获取用户操作系统位数类型
     * @property osbit
     * @type String
     */
    osbit: bit,

    /**
     * 判断浏览器是否为IE6
     * @property isIE6
     * @type Boolean
     */
    isIE6 : isIE6,
    /**
     * 判断浏览器是否支持placeholder
     * @property placeholder
     * @type Boolean
     */
    placeholder : placeholder,
    /**
     * 判断浏览器是否支持 transition
     * @property transition
     * @type {Boolean}
     */
    transition : transition,
    /**
     * 浏览器支持的transition结束属性
     * @property transitionEnd
     * @type {Boolean}
     */
    transitionEnd : transitionEnd,
    /**
     * 浏览器的CSS3前缀
     * @property browserPre
     * @type {Boolean}
     */
    browserPre : browserPre
}

module.exports = Detect;