
var Promise = require('bluebird');
var Domain = require('../models').Domain;
var request = require('request-promise');
var cheerio = require('cheerio');

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

                    return resolve(createDomain(domainString));


                });
        });
    },

    createDomain: createDomain

};


/**
 * Create a Domain
 *
 * @param domainString
 * @returns {Promise}
 */
function createDomain (domainString) {

    return new Promise(function (resolve, reject) {

        getDomainUrl(domainString)
            .then(function (urlObj) {

                if (!urlObj) {
                    return reject('Could not resolve ' + domainString);
                }

                getFaviconUrl(domainString, urlObj.body)
                    .then(function (faviconUrl) {

                        return Domain.create({
                            name: domainString,
                            url: urlObj.url,
                            faviconUrl: faviconUrl || null
                        },{ ignore: true });

                    }).then(function (domain) {
                        return resolve(domain);
                    })

            });

    });

}

/**
 * Returns the domain URL if it can be found, else false.
 *
 * @param domain
 * @returns {Promise<{url, body} | false>}
 */
function getDomainUrl (domain) {

    return new Promise(function (resolve, reject) {
        request(
            {
                uri: 'http://'+domain,
                resolveWithFullResponse: true,
                timeout: 2000

            }
        ).then(function (response){
                return resolve({url: response.request.uri.href, body: response.body});
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
 * @param body
 * @returns {Promise<url | false>}
 */
function getFaviconUrl (domain, body) {

    return new Promise(function (resolve, reject) {

        var $ = cheerio.load(body);

        var faviconPath = $('link[rel="shortcut icon"], link[rel="icon"]')
            .attr('href');

        if (faviconPath) {

            // Check if this is a full url
            if (/^http/.test(faviconPath)) {
                return resolve(faviconPath);
            } else {
                // Else is it is relative path
                return resolve('http://' + domain + faviconPath);
            }

        } else {
            // See if /favicon is an image

            request(
                {
                    uri: 'http://' + domain + '/favicon.ico',
                    resolveWithFullResponse: true

                }
            ).then(function (response) {

                var content_type = response.headers['content-type'].toLowerCase().split("; ")[0];
                var type = content_type.split("/")[0];

                if (type == "image") {
                    // Found it
                    return resolve('http://' + domain + '/favicon.ico');
                } else {
                    return resolve(false);
                }

            }).catch(function (reason) {
                return resolve(false);
            });

        }

    });
}