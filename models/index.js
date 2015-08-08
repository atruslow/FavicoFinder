"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var config    = require(__dirname + '/../config/config');
var sequelize;
var db        = {};

sequelize = new Sequelize(
    config.dbSchema,
    config.dbUser,
    config.dbPass,
    {
        dialect:  'mysql',
        host:     config.dbHost,
        port:     config.dbPort,
        logging:  console.log
    }
);



fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = sequelize["import"](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;