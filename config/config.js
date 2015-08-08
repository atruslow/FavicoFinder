/**
 * This module simply looks to see if environment variables have been set. If not it defaults to localhost.
 *
 * @type {{port: (number), dbHost: (string), dbSchema: (string), dbUser: (string), dbPass: (string)}}
 */

module.exports = {
    port: process.env.PORT || 8080,
    dbPort: process.env.DBPORT || 3306,
    dbHost: process.env.DBHOST || 'localhost',
    dbSchema: process.env.DBSCHEMA || 'favicon',
    dbUser: process.env.DBUSER || 'root',
    dbPass: process.env.DBPASS || ''
};


/*
export DBHOST=favicondb.cog1a6qr9kd9.us-east-1.rds.amazonaws.com;
export DBPORT=3306;
export DBSCHEMA=favicon;
export DBUSER=crayon_interview;
export DBPASS=crayola777;
 */