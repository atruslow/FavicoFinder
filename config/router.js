/**
 * This module sets up the controllers
 *
 * @type {{bootstrap: Function}}
 */

module.exports = {
    bootstrap: function(app){
        require('../controllers/faviconController').controller(app);
        require('../controllers/defaultController').controller(app);
    }
};