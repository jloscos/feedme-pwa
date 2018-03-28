var path = require("path");

var config = {
    entry: ["./src/sw.ts"],

    output: {
        path: path.resolve("./wwwroot"),
        filename: "sw.js"
    },

    resolve: {
        extensions: [".ts", ".js"]
    },
    devtool: "source-map",

    module: {
        loaders: [
            { test: /\.ts$/, loader: "awesome-typescript-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
        ]
    }
};

module.exports = config;
