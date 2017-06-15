/**
 * Checks if given object is a DOMElement
 * @param {object} element
 * @returns {boolean}
 */
var isElement = function(element) {
    if (typeof HTMLElement === 'object') {
        return element instanceof HTMLElement;
    }

    return element && typeof element === 'object' && element.nodeType === 1 && typeof  element.nodeName === 'string';
};

/**
 * Checks if given parameter is a DOMNode
 * @param node
 * @returns {*}
 */
var isNode = function(node) {
    if (typeof Node === 'object') {
        return node instanceof Node;
    }
    return node && typeof node === 'object' && typeof node.nodeType === 'number' && typeof node.nodeName === 'string';
};

function _extendObject(first, second) {
    for (var secondProp in second ) {
        var secondVal = second[secondProp];
        if (secondVal && Object.prototype.toString.call(secondVal) === "[object Object]") {
        	if(isNode(secondVal) || isElement(secondVal)) {
        		first[secondProp] = secondVal;
        	}else {
	            first[secondProp] = first[secondProp] || {};
            	_extendObject(first[secondProp], secondVal);
        	}
        }
        else {
            first[secondProp] = secondVal;
        }
    }
    return first;
};
/**
 * Checks if given value is an array
 * @param {*} object
 * @returns {boolean}
 * @private
 */
function _isArray(object) {
    return Object.prototype.toString.call(object) === '[object Array]';
}

/**
 * Checks if given value is an object
 * @param {*} object
 * @returns {boolean}
 * @private
 */
function _isObject(object) {
    return object && typeof object === 'object';
}
/**
 * Clones object and returns its copy.
 * Copies Objects, Arrays, Functions and primitives.
 *
 * @param {Object} object
 * @private
 */
function _cloneObject(object) {
    var copy;
    var property;
    var type;

    if (!_isObject(object) || object === null) {
        copy = object;
        return copy;
    }

    if (_isArray(object)) {
        copy = [];
        for (var i = 0, l = object.length; i < l; i++) {
            copy[i] = _cloneObject(object[i]);
        }
        return copy;
    }

    try {
        copy = new object.constructor();
    } catch (e) {
        copy = {};
    }

    for (property in object) {
        if (!object.hasOwnProperty(property)) {
            continue;
        }

        if (_isObject(object[property]) && object[property] !== null) {
            copy[property] = _cloneObject(object[property]);
        } else {
            copy[property] = object[property];
        }
    }
    return copy;
}
function loadScript(url, callback, error, timeout) {  
	var timer = null;
	var script = document.createElement("script");
	var loaded = false;
	script.type = "text/javascript";
	if (script.readyState) { // IE    
		script.onreadystatechange = function() {
			if (script.readyState == "loaded" || script.readyState == "complete") {
				script.onreadystatechange = null;
				loaded = true;
				if (typeof callback == "function"){
					callback();
				}
			}
		};
	} else { // Others    
		script.onload = function() {
			loaded = true;
			if (typeof callback == "function"){
				callback();
			}
		};
	}
	script.onerror = function(e){
		clearTimeout(timer);
		error && error(e);
	};
	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
	if (timeout) {
		timer = setTimeout(function(){
			if(loaded) {
				clearTimeout(timer);
			} else {
				error && error();
			}
		}, timeout);
	}
	return script;
}
// function parseJSON(jsonStr){
// 	if (window.JSON && JSON.parse) {
// 		return JSON.parse(jsonStr);
// 	} else {
// 		return (new Function("return " + jsonStr))();
// 	}
// }
function rid(prefix){
	var t = new Date().getTime() + Math.round(Math.random() * 1000);
	return (prefix || "") + '_' + t;
}
var corsSupport = 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest();
module.exports = {
	id: rid,
	extend: _extendObject,
	clone: _cloneObject,
	loadJs: loadScript,
	// parseJSON: parseJSON,
	corsSupport:corsSupport
};