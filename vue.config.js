const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: 8009,
    proxy: {
      "/api": {
        target: "http://localhost:8003/",
        pathRewrite: { "^/api": "" }, // 重写请求路径
        ws: true, // 用于支持 websocket（默认 true）
        changeOrigin: true, // 用于控制请求头中的 host值（true：伪装成与服务器同源；false：提供真实 host。默认 true）
      },
    },
  },
});
