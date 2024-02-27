const db = require('../../config/db');

exports.getCategory = async function(categoryId) {
    console.log( 'Request to get a category by a give category id ...' );

    const query = `SELECT * FROM Category WHERE category_id = ?`
    const [ rows ] = await db.getPool().query( query, categoryId );
    return rows;
};

exports.getCategories = async function() {
    console.log( 'Request to get all categories ...' );

    const query = `SELECT * FROM Category`
    const [ rows ] = await db.getPool().query( query );
    return rows;
};