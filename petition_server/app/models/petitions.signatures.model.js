const db = require('../../config/db');

exports.getSignaturesByPetitionId = async function(petitionId){
    console.log( 'Request to get all signatures with a given petition id...' );

    const query = `SELECT Signature.signatory_id, User.name, User.city, User.country, Signature.signed_date
        FROM (Signature 
        INNER JOIN User ON Signature.signatory_id = User.user_id)
        WHERE Signature.petition_id = ?
        ORDER BY signed_date ASC`;
    const [ rows ] = await db.getPool().query( query, petitionId );
    return rows;
};

exports.getSignatoriesByPetitionId = async function(petitionId) {
    console.log( 'Request to get all signatories by a give petition id ...' );

    const query = `SELECT signatory_id FROM Signature WHERE petition_id = ?`;
    const [ rows ] = await db.getPool().query( query, petitionId );
    return rows;
};

exports.signPetition = async function(signaoryId, petitionId) {
    console.log( 'Request to sign a petition ...' );

    const signedDate = new Date().toISOString().substr(0, 19).replace('T', ' ');
    const query = `INSERT INTO Signature (signatory_id, petition_id, signed_date) VALUES (?, ?, ?)`;
    const [ rows ] = await db.getPool().query( query, [signaoryId, petitionId, signedDate] );
    return rows;
};

exports.deleteSignature = async function(userId, petitionId){
    console.log( 'Request to delete a signature...' );

    const query = `DELETE FROM Signature WHERE signatory_id = ? AND petition_id = ?`;
    const [ rows ] = await db.getPool().query( query, [userId, petitionId] );
    return rows;
};

exports.deleteSignatures = async function(petitionId){
    console.log( 'Request to delete signatures...' );

    const query = `DELETE FROM Signature WHERE petition_id = ?`;
    const [ rows ] = await db.getPool().query( query, petitionId );
    return rows;
};
