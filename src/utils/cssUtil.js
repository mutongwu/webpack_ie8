var doc = document,
    head = document.getElementsByTagName("head")[0],
    linkEls = doc.getElementsByTagName("link"),
    styleEls = doc.getElementsByTagName("style"),
    poorIE = /MSIE ([^;]+)/.test(navigator.userAgent) && parseInt(RegExp.$1, 10) < 10,
    IMPORT_ID = "importLink_ID",
    APPEND_ID = "appendStyle_ID",
    /** 
     * IE6~9 的BUG:link+style元素的个数，不能大于31个。 
     */
    LIMIT = 31,
    // 至少保留两个位置给我们定义的style元素：一个用于import，一个用于append  
    maxNum = LIMIT - 2,
    isLimited = false;

/** 
 * @description 创建添加一个LINK元素 
 * @param {String} url 样式链接 
 * @return link元素 
 */
function createLinkEl(url) {
    var link = doc.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    head.appendChild(link);
    return link;
}

/** 
 * @description 创建添加一个style元素 
 * @param {String} str 样式规则 
 * @param {String} id 元素ID 
 * @return style元素 
 */
function createStyleEl(str, id) {
    var el = doc.createElement("style");
    el.type = "text/css";
    if (id) {
        el.id = id;
    }
    if (str) {
        if (poorIE) {
            el.styleSheet.cssText = str; //IE    
        } else {
            el.appendChild(document.createTextNode(str));
        }
    }
    head.appendChild(el);
    return el;
}

function checkLimit() {
    if (!isLimited && poorIE) {
        if (linkEls.length + styleEls.length >= maxNum) {
            isLimited = true;
        }
    }
    return isLimited;
}

function loadStyle(url) {
    if (checkLimit()) {
        doImportStyle(url);
    } else {
        doLoadStyle(url);
    }
}

function loadStyleStr(str) {
    if (checkLimit()) {
        doAppendStr(str);
    } else {
        doLoadStr(str);
    }
}

function doLoadStr(str) {
    createStyleEl(str);
}

function doAppendStr(str) {
    var el = doc.getElementById(APPEND_ID);
    if (!el) {
        createStyleEl(str, APPEND_ID);
    } else {
        el.styleSheet.cssText = el.styleSheet.cssText + str;
    }
}

function doImportStyle(url) {
    var el = doc.getElementById(IMPORT_ID),
        styleEl = null;
    if (!el) {
        styleEl = createStyleEl(null, IMPORT_ID);
        styleEl.styleSheet.addImport(url);
    } else {
        el.styleSheet.addImport(url);
    }
}

function doLoadStyle(url) {
    createLinkEl(url)
}

//export  

module.exports = {
    //加载外链css  
    loadStyle: loadStyle,

    //直接添加样式规则  
    loadStyleStr: loadStyleStr
};