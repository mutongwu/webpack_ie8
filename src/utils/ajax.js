function ajax(options) {

    var emptyFn = function() {};
    var encodeFn = encodeURIComponent;
    var url = options.url || "", //请求的链接
        type = (options.type || "GET").toUpperCase(), //请求的方法,默认为get
        data = options.data || null, //请求的数据
        contentType = options.contentType || "", //请求头
        dataType = options.dataType || "", //请求的类型
        async = options.async === undefined ? true : options.async, //是否异步，默认为true.
        timeout = options.timeout, //超时时间。 
        before = options.before || emptyFn, //发送之前执行的函数
        error = options.error || emptyFn, //错误执行的函数
        success = options.success || emptyFn; //请求成功的回调函数
    var timeout_bool = false, //是否请求超时
        timeout_flag = null, //超时标识
        xhr = null; //xhr对角

    //编码数据
    function setData() {
        //设置对象的遍码
        function setObjData(data, parentName) {
            function encodeData(name, value, parentName) {
                var items = [];
                name = parentName === undefined ? name : parentName + "[" + name + "]";
                if (typeof value === "object" && value !== null) {
                    items = items.concat(setObjData(value, name));
                } else {
                    name = encodeFn(name);
                    value = encodeFn(value);
                    items.push(name + "=" + value);
                }
                return items;
            }
            var arr = [],
                value;
            if (Object.prototype.toString.call(data) == '[object Array]') {
                for (var i = 0, len = data.length; i < len; i++) {
                    value = data[i];
                    arr = arr.concat(encodeData(typeof value == "object" ? i : "", value, parentName));
                }
            } else if (Object.prototype.toString.call(data) == '[object Object]') {
                for (var key in data) {
                    value = data[key];
                    arr = arr.concat(encodeData(key, value, parentName));
                }
            }
            return arr;
        };
        //设置字符串的遍码，字符串的格式为：a=1&b=2;
        function setStrData(data) {
            var arr = data.split("&");
            for (var i = 0, len = arr.length; i < len; i++) {
                name = encodeFn(arr[i].split("=")[0]);
                value = encodeFn(arr[i].split("=")[1]);
                arr[i] = name + "=" + value;
            }
            return arr;
        }

        if (data) {
            if (typeof data === "string") {
                data = setStrData(data);
            } else if (typeof data === "object") {
                data = setObjData(data);
            }
            data = data.join("&").replace("/%20/g", "+");
            //若是使用get方法或JSONP，则手动添加到URL中
            if (type === "GET" || dataType === "jsonp") {
                url += url.indexOf("?") > -1 ? (url.indexOf("=") > -1 ? "&" + data : data) : "?" + data;
            }
        }
    }
    // JSONP
    function createJsonp() {
        var script = document.createElement("script"),
            timeName = new Date().getTime() + Math.round(Math.random() * 1000),
            callback = "JSONP_" + timeName;

        window[callback] = function(data) {
            clearTimeout(timeout_flag);
            document.body.removeChild(script);
            success(data);
        }
        script.src = url + (url.indexOf("?") > -1 ? "&" : "?") + "callback=" + callback;
        script.type = "text/javascript";
        document.body.appendChild(script);
        setTime(callback, script);
        return script;
    }
    //设置请求超时
    function setTime(callback, script) {
        if (timeout !== undefined) {
            timeout_flag = setTimeout(function() {
                if (dataType === "jsonp") {
                    delete window[callback];
                    document.body.removeChild(script);

                } else {
                    timeout_bool = true;
                    xhr && xhr.abort();
                }
                console.log("timeout");

            }, timeout);
        }
    }

    // XHR
    function createXHR() {
        //由于IE6的XMLHttpRequest对象是通过MSXML库中的一个ActiveX对象实现的。
        //所以创建XHR对象，需要在这里做兼容处理。
        function getXHR() {
            if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            } else {
                try {
                    return new ActiveXObject("MSXML2.XMLHTTP.3.0");
                }
                catch(ex) {
                    return null;
                }
            }
        }
        //创建对象。
        xhr = getXHR();
        if (!xhr) {
            console.log('AJAX (XMLHTTP) not supported.');
            return null;
        }
        xhr.open(type, url, async);
        //设置请求头
        if (type === "post" && !contentType) {
            //若是post提交，则设置content-Type 为application/x-www-four-urlencoded
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        } else if (contentType) {
            xhr.setRequestHeader("Content-Type", contentType);
        }
        //添加监听
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (timeout !== undefined) {
                    //由于执行abort()方法后，有可能触发onreadystatechange事件，
                    //所以设置一个timeout_bool标识，来忽略中止触发的事件。
                    if (timeout_bool) {
                        return;
                    }
                    clearTimeout(timeout_flag);
                }
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {

                    success(xhr.responseText);
                } else {
                    error(xhr.status, xhr.statusText);
                }
            }
        };
        //发送请求
        xhr.send(type === "GET" ? null : data);
        setTime(); //请求超时
        return xhr;
    }

    setData();
    before();
    if (dataType === "jsonp") {
        return createJsonp();
    } else {
        return createXHR();
    }
}

module.exports = ajax;