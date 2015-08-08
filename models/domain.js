/**
 * Domain Model
 *
 * @param sequelize
 * @param DataTypes
 * @returns {*|Model}
 */

module.exports = function(sequelize, DataTypes) {

    var Domain = sequelize.define("Domain", {

        name: {type: DataTypes.STRING, unique: true},
        url: {type: DataTypes.STRING, notEmpty: true},
        faviconUrl: {type: DataTypes.STRING }

    });

    return Domain;
};
