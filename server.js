var express = require('express');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');
var expressValidator = require('express-validator')
var router = require('./config/router');
var models = require("./models");
var path = require('path');
var config = require('./config/config');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(expressValidator());

app.use(methodOverride());

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/img', express.static(__dirname + '/assets/img'));

router.bootstrap(app);

models.sequelize.sync()
    .then(function () {
        var server = app.listen(config.port, function () {
            console.log('Express server listening on port ' + server.address().port);
        });
});