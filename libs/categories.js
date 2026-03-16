var database = require('../libs/database');

var { con, con2 } = database.getMySQLConnections();

async function checksertCategory(categoryName) {
    const querySelect = 'SELECT id FROM expense_categories WHERE name = ?';
    const [rows] = await con2.execute(querySelect, [categoryName]);

    if (rows.length > 0) {
        return rows[0].id;
    }

    const queryInsert = 'INSERT INTO expense_categories (name) VALUES (?)';
    const [result] = await con2.execute(queryInsert, [categoryName]);
    return result.insertId;
}

module.exports = {
    checksertCategory,
    default: {
        checksertCategory
    }
};