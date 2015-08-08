
var _ = require('lodash');
var Domain = require('../models').Domain;
var domainService = require('../services/domainService');

module.exports = {

    /**
     * Controller function for favicon actions
     *
     * @param app
     */
    controller: function (app) {

        /**
         * Displays index page.
         */
        app.get('/', function (req, res) {

            res.render('index', {errors: unSerialize(req.query['errors']), msgs: unSerialize(req.query['msgs'])});

        });

        /**
         * POST action for index form.
         * Either returns a domain from the DB or creates a new record.
         * Redirects to GET.
         */
        app.post('/', function (req, res) {

            // Validate that the input is a fully qualified domain
            req.checkBody(
                'domain',
                'Please enter a valid domain name. For example google.com.'
            ).isFQDN();

            if (req.validationErrors()) {
                return redirect(res, '/', {errors: req.validationErrors()});
            }

            domainService
                .loadDomain(req.body['domain'])
                .then(function (domain) {

                    return redirect(res, '/',
                        {
                            msgs: [
                                {
                                    msg: 'Domain: ' + domain.name
                                },
                                {
                                    msg: 'URL: ' + domain.url
                                },
                                {
                                    msg: 'faviconUrl: ' + domain.faviconUrl
                                }
                            ]
                        }
                    );

                }).catch(function (error) {
                    console.log(error);
                    return redirect(res, '/', {errors: [{msg: 'An Unexpected Error Has Occurred'}]});
                });

        });

    }
};



/**
 * Redirects to a route with params.
 * There isn't a great way to serialize JS objects. In the interest of time I just JSON encode them and decode them on the other side.
 * If I had more time I would serialize them correctly.
 *
 * @param res      Response object
 * @param location Location to redirect to
 * @param params   Object who's keys will be turned into query params
 * @returns res.redirect
 */
function redirect (res, location, params) {
    var queryString = location+'?';

    _.each(params, function(item, key) {
        queryString+= key+'='+encodeURIComponent(JSON.stringify(item));
    });

    return res.redirect(queryString);
}

/**
 * Parses a Stringified Json
 *
 * @param stringifiedJson
 * @returns {JSON | null}
 */
function unSerialize(stringifiedJson) {
    var json;
    try {
        json = JSON.parse(stringifiedJson);
    } catch (e) {
        json = null;
    }
    return json;
}