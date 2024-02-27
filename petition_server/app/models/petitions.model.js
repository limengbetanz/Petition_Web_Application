const db = require('../../config/db');

// Return petition_id, title, description, author_id, category_id, created_date, closing_date
exports.getPetitionByPetitionId = async function(id){
    console.log( 'Request to get a petition by a give petition id ...' );

    const query = `SELECT * FROM Petition WHERE petition_id = ?`
    const [ rows ] = await db.getPool().query( query, id );
    return rows;
};

// Return petitionId, title, description, authorName, authorName, authorId, authorCity, authorCountry, createdDate, closingDate
exports.getPetitionByPetitionId_v2 = async function(id){
    console.log( 'Request to get a petition ...' );

    let query = `SELECT Petition.petition_id, Petition.title, Petition.description, Petition.author_id, 
    Petition.created_date, Petition.closing_date, Category.name AS category_name, User.name AS author_name, 
    User.city, User.country, Signature.signatory_id
        FROM (((Petition
        INNER JOIN Category ON Petition.category_id = Category.category_id)
        INNER JOIN User ON Petition.author_id = User.user_id)
        INNER JOIN Signature ON Petition.petition_id = Signature.petition_id)
        WHERE Petition.petition_id = ?`;

    const [ rows ] = await db.getPool().query( query, [id] );
    return rows;
};

exports.getPetitionByAuthorIdAndCreateDate = async function(authorId, createdDate){
    console.log( 'Request to get a petition by a give petition author id and created date ...' );

    const query = `SELECT * FROM Petition WHERE author_id = ? AND created_date = ?`
    const [ rows ] = await db.getPool().query( query, [authorId, createdDate] );
    return rows;
};

exports.getPetitionsByMultiContitions = async function(startIndex, count, titleSegment, categoryId, authorId) {
    console.log( 'Request to get all petitions from the database...' );

    let query = `SELECT Petition.petition_id, Petition.title, Petition.category_id, Petition.author_id, Category.name AS category_name, User.name AS user_name
        FROM (((Petition
        INNER JOIN Category ON Petition.category_id = Category.category_id)
        INNER JOIN User ON Petition.author_id = User.user_id)
        INNER JOIN Signature ON Petition.petition_id = Signature.petition_id)`;

    const [ rows ] = await db.getPool().query( query );
    return rows;
};

exports.insertPetition = async function( title, description, authorId, categoryId, createdDate, closingDate ) {
    console.log( `Request to insert a petition into the database...` );

    const query = `INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date, photo_filename) 
    VALUES ( ?, ?, ?, ?, ?, ?, ? )`;
    const [ result ] = await db.getPool().query( query, [ title, description, authorId, categoryId, createdDate, closingDate, null ] );
    return result;
};

exports.updatePetition = async function( petitionId, title, description, categoryId, createdDate, closingDate ) {
    console.log( `Request to update a petition into the database...` );

    const query = `UPDATE Petition SET title = ?, description = ?, category_id = ?, closing_date = ?  WHERE petition_id = ?`;
    const [ result ] = await db.getPool().query( query, [ title, description, categoryId, closingDate, petitionId ] );
    return result;
};

exports.deletePetition = async function( petitionId ) {
    console.log( `Request to delete a petition into the database...` );

    const query = `DELETE FROM Petition WHERE petition_id = ?`;
    const [ result ] = await db.getPool().query( query, petitionId );
    return result;
};

exports.updatePhotoName = async function(id, fileName){
    console.log( 'Request to update current petition hero\'s photo...' );

    const query = `UPDATE Petition SET photo_filename = ? WHERE petition_id = ?`;
    const [ rows ] = await db.getPool().query( query, [fileName, id] );
    return rows;
};
