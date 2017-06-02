require('../lib/es5-shim-lite');

var styleStr = require('../css/wap.styl').toString();
var cssUtil = require('../utils/cssUtil');

cssUtil.loadStyleStr(styleStr);
var Detect = require('../utils/detect');
console.log(Detect)

var foo = {"class":'xxxx', name:300};
console.log(foo['class'], foo.name)

var imgPath = require('../images/icons/icon_success_least_small@3x.png');
console.log(imgPath)