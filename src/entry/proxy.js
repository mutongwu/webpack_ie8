require('../lib/es5-shim-lite');
var Messenger = require('../lib/messenger');

function parseJSON(str){
    if (window.JSON && JSON.parse) {
        return JSON.parse(str);
    } else {
        try{
            return (new Function("return " + str))();
        }catch(e){
            sendMessage('invalid json to send.');
        }
    }
}
function ajax(o){
    var httpRequest = new XMLHttpRequest();
    try {
        httpRequest.open(o.method || 'get', o.url, !!o.async);
        httpRequest.onreadystatechange = function(){
            if (httpRequest.readyState == 0 || httpRequest.readyState == 4) {
                if(httpRequest.status == 0 || (httpRequest.status >= 200 && httpRequest.status < 300) || 
                    httpRequest.status == 304 || httpRequest.status == 1223){
                    sendMessage(httpRequest.responseText);
                } else {
                    sendMessage('ajax send failed.');
                }
            }
        };
        httpRequest.onerror = function(){
            sendMessage('ajax send failed.');
        };
        httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        httpRequest.send(o.data || null);
    }
    catch (e) {
        sendMessage("Cannot connect to the server!");
        return;
    }
}
var IFRAME_NAME = 'vsc_cors_iframe', 
	PARENT_NAME = 'vsc_cors_parent', 
	NAME_PREFIX = 'vip_secure_code';
var messenger = new Messenger(IFRAME_NAME, NAME_PREFIX);

function sendMessage(msg) {
    messenger.targets[PARENT_NAME].send(msg);
}
messenger.addTarget(window.parent, PARENT_NAME); 

messenger.listen(function (msg) {
    var o = parseJSON(msg);
    ajax(o);
});