const db = require('../../config/db');

exports.getByMail = async function(email){
    console.log( 'Request to get a user by given mail address...' );

    const query = `SELECT * FROM User WHERE email = ?`;
    const [ rows ] = await db.getPool().query( query, email );
    return rows;
};

exports.getByToken = async function(token){
    console.log( 'Request to get a user by given token...' );

    const query = `SELECT * FROM User WHERE auth_token = ?`
    const [ rows ] = await db.getPool().query( query, token );
    return rows;
};

exports.getById = async function(id){
    console.log( 'Request to get a user by given id...' );

    const query = `SELECT * FROM User WHERE user_id = ?`
    const [ rows ] = await db.getPool().query( query, id );
    return rows;
};

exports.create = async function(name, email, password, city, country){
    console.log( 'Request to create a new user...' );

    const query = `INSERT INTO User (name, email, password, city, country, auth_token, photo_filename) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [ rows ] = await db.getPool().query( query, [name, email, password, city, country, null, null]);
    return rows;
};

exports.login = async function(email, password){
    console.log( 'Request to login...' );

    let query = `SELECT * FROM User WHERE email = ? AND password = ?`;
    const [ rows ] = await db.getPool().query( query, [email, password] );

    if(rows.length === 1) {
        let token = Math.random().toString(36).substr(2);
        token += Math.random().toString(36).substr(2);
        query = `UPDATE User SET auth_token = ? WHERE email = ?`;
        const [ updatedRow ] = await db.getPool().query( query, [token, email] );
        rows[0].auth_token = token;
    }
    return rows;
};

exports.logout = async function(token){
    console.log( 'Request to logout...' );

    const query = `UPDATE User SET auth_token = ? WHERE auth_token = ?`;
    const [ rows ] = await db.getPool().query( query, [null, token] );
    return rows;
};

exports.updateInfo = async function(name, email, password, city, country, token){
    console.log( 'Request to update...' );

    const query = `UPDATE User SET name = ?, email = ?, password = ?, 
    city = ?, country = ? WHERE auth_token = ?`;
    const [ rows ] = await db.getPool().query( query, [name, email, password, city, country, token]);
    return rows;
};

exports.updatePhotoName = async function(id, fileName){
    console.log( 'Request to update current users profile photo...' );

    const query = `UPDATE User SET photo_filename = ? WHERE user_id = ?`;
    const [ rows ] = await db.getPool().query( query, [fileName, id] );
    return rows;
};