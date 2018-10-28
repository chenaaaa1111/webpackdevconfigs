module.exports = {
    entry : __dirname + 'index.js',
    output : {
        path : __dirname + '/assets/js',
        filename : 'index.js',
        publicPath : '/temp/'
    },
    devServer : {
        contentBase : './seatsort',
        host : 'localhost', //这里要是本地是IP地址。
        port : '8086',
    }
}
