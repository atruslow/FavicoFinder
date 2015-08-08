
var Promise = require('bluebird');
var Domain = require('../models').Domain;
var request = require('request-promise');
var $ = require('jquery');

module.exports = {

    /**
     * Verifies that a domain exists, then tries to find the favicon. Then loads into the DB.
     * Returns the domain model or rejects.
     *
     * @param domainString
     * @returns {Promise}
     */
    loadDomain: function (domainString) {

        return new Promise(function (resolve, reject) {

            Domain.findOne(
                {
                    where: {
                        name: domainString
                    }
                }
            ).then(function (domain) {

                    // If found, return
                    if (domain) {
                        return resolve(domain);
                    }

                    // Else we need to create the domain record
                    getDomainUrl(domainString)
                        .then(function (url) {

                            if (!url) {
                                return reject('Could not resolve '+domainString);
                            }

                            getFaviconUrl(domainString)
                                .then(function (faviconUrl) {

                                    return Domain.create({
                                        name: domainString,
                                        url: url,
                                        faviconUrl: faviconUrl || null
                                    });

                                }).then(function (domain) {
                                    return resolve(domain);
                                })

                        });
                });
        });
    }

};


/**
 * Returns the domain URL if it can be found, else false.
 *
 * @param domain
 * @returns {Promise<url | false>}
 */
function getDomainUrl (domain) {

    return new Promise(function (resolve, reject) {
        request(
            {
                uri: 'http://'+domain,
                resolveWithFullResponse: true

            }
        ).then(function (response){
                return resolve(response.request.uri.href);
            })
            .catch(function(reason) {
                return resolve(false);
            });
    });

}



/**
 * Returns the Favicon URL if it can be found, else false.
 *
 * @param domain
 * @returns {Promise<url | false>}
 */
function getFaviconUrl (domain) {

    return new Promise(function (resolve, reject) {

        //First check to see if /favicon.ico is a 200

        request(
            {
                uri: 'http://' + domain + '/favicon.ico',
                resolveWithFullResponse: true

            }
        ).then(function (response){

                // This is a 200 series response

                var content_type = response.headers['content-type'].toLowerCase().split("; ")[0];
                var type = content_type.split("/")[0];

                if (type == "image" ) {
                    // Found it
                    return resolve('http://' + domain + '/favicon.ico');
                } else {
                    throw "Favicon not found";
                }


            }).catch(function (reason) {

                // /favicon.ico is not a 200
                // Or is not an image
                // Look for the favicon.ico in the html

                request(
                    {
                        uri: 'http://' + domain,
                        resolveWithFullResponse: true

                    }
                ).then(function (response) {

                        var faviconPath = $(response.body)
                            .find('link[rel="shortcut icon"], link[rel="icon"]')
                            .href();

                        if (faviconPath) {
                            return resolve('http://' + domain + faviconPath);
                        }

                        return resolve(false);

                    }).catch(function(reason) {
                        return resolve(false);
                    });

            });
    });

}