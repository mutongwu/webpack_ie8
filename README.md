###验证码组件

推荐使用 yarn 来安装依赖：
1. 环境初始化：yarn install
2. 开发：npm run dev
3. 发布：npm run build


考虑到 1.要兼容 IE7/8(不支持 es5、css3选择器)；2.减少代码体积；因此：
不用 webpack 2 —— 依赖 Object.defineProperty
不用 css-loader —— 依赖 querySelector
不直接使用 es5-shim ，引入一个小的 pollyfill —— 减少体积
目前添加的 es5属性有：
Array.prototype.map —— css-loader
Array.prototype.forEach/Array.prototype.map
Function.prototype.bind


