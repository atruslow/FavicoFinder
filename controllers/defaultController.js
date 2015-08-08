/**
 * Sets default action if no matching route is found
 *
 * @type {{controller: Function}}
 */

module.exports = {

    controller: function (app) {

        app.get('*', function (req, res) {
            res.redirect('/');
        });

    }
};
