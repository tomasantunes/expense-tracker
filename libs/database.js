var mysql = require("mysql2");
var mysql2 = require('mysql2/promise');
var secretConfig = require('../secret-config');

function getMySQLConnections() {
    var con;
    var con2;
    if (secretConfig.ENVIRONMENT == "WINDOWS" || secretConfig.ENVIRONMENT == "MACOS") {
        con = mysql.createPool({
            connectionLimit : 90,
            connectTimeout: 1000000,
            host: secretConfig.DB_HOST,
            user: secretConfig.DB_USER,
            password: secretConfig.DB_PASSWORD,
            database: secretConfig.DB_NAME,
            timezone: '+01:00',
            port: 3306,
            dateStrings: true
        });

        con2 = mysql2.createPool({
            connectionLimit : 90,
            connectTimeout: 1000000,
            host: secretConfig.DB_HOST,
            user: secretConfig.DB_USER,
            password: secretConfig.DB_PASSWORD,
            database: secretConfig.DB_NAME,
            timezone: '+01:00',
            port: 3306,
            dateStrings: true
        });
    } 
    else if (secretConfig.ENVIRONMENT == "UBUNTU") {
        con = mysql.createPool({
            connectionLimit : 90,
            connectTimeout: 1000000,
            host: secretConfig.DB_HOST,
            user: secretConfig.DB_USER,
            password: secretConfig.DB_PASSWORD,
            database: secretConfig.DB_NAME,
            socketPath: '/var/run/mysqld/mysqld.sock',
            timezone: '+01:00',
            dateStrings: true
        });

        con2 = mysql2.createPool({
            connectionLimit : 90,
            connectTimeout: 1000000,
            host: secretConfig.DB_HOST,
            user: secretConfig.DB_USER,
            password: secretConfig.DB_PASSWORD,
            database: secretConfig.DB_NAME,
            socketPath: '/var/run/mysqld/mysqld.sock',
            timezone: '+01:00',
            dateStrings: true
        });
    }

    return { con, con2 };
}

// Export in a way that works with both require() and import
module.exports = {
    getMySQLConnections,
    default: {
        getMySQLConnections
    }
};