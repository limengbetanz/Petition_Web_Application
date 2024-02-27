const signaturesModel = require('../models/petitions.signatures.model');
const usersModel = require('../models/users.model');
const petitionsModel = require('../models/petitions.model');

const INVALID_TOKEN = "invalid_token";

exports.listSignatures = async function(req, res){
    console.log( '\nRequest to get all the signatures of a given petition...' );
    const id = req.params.id;

    try {
        const signatureInfos = await signaturesModel.getSignaturesByPetitionId(id);
        if(signatureInfos.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        const result = [];
        for(const info of signatureInfos) {
            const signatureItem = {};
            signatureItem["signatoryId"] = info.signatory_id;
            signatureItem["name"] = info.name;
            signatureItem["city"] = info.city || null;
            signatureItem["country"] = info.country || null;
            signatureItem["signedDate"] = info.signed_date;
            result.push(signatureItem);
        }

        res.status( 200 ).set({ 'content-type': 'application/json; charset=utf-8' })
            .send( JSON.stringify(result) );
    } catch( err ) {
        console.log(err);
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.signOnePetition = async function(req, res){
    console.log( '\nRequest to sign a petition with a given petition id...' );

    const id = req.params.id;

    const token = req.header('X-Authorization') || INVALID_TOKEN;
    if(token === INVALID_TOKEN) {
        res.status(401)
            .send(`Unauthorized`);
        return;
    }

    try {
        const currentUser = await usersModel.getByToken(token);
        if(currentUser.length === 0) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        const signatories = await signaturesModel.getSignatoriesByPetitionId(id);
        if(signatories.length !== 0) {
            for(const signatory of signatories) {
                if(signatory.signatory_id == currentUser[0].user_id) {
                    res.status(403)
                        .send(`Forbidden`);
                    return;
                }
            }
        }

        const petitions = await petitionsModel.getPetitionByPetitionId(id);
        if(petitions.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        const now = new Date();
        const closingDate = new Date(petitions[0].closing_date);
        const hasClosed = closingDate.getTime() < now.getTime();
        if(hasClosed) {
            res.status(403)
                .send(`Forbidden`);
            return;
        }

        const signedPetitions = await signaturesModel.signPetition(currentUser[0].user_id, id);
        res.status( 201 )
            .send( "Created" );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.deletOneSignature = async function(req, res){
    console.log( '\nRequest to delete a signature...' );

    const id = req.params.id;

    const token = req.header('X-Authorization') || INVALID_TOKEN;
    if(token === INVALID_TOKEN) {
        res.status(401)
            .send(`Unauthorized`);
        return;
    }

    try {
        const currentUser = await usersModel.getByToken(token);
        if(currentUser.length === 0) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        const petitions = await petitionsModel.getPetitionByPetitionId(id);
        if(petitions.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        if(petitions[0].author_id == currentUser[0].user_id) {
            res.status(403)
                .send(`Forbidden`);
            return;
        }

        const signatories = await signaturesModel.getSignatoriesByPetitionId(id);
        if(signatories.length !== 0) {
            let hasSigned = false;
            for(const signatory of signatories) {
                if(signatory.signatory_id == currentUser[0].user_id) {
                    hasSigned = true;
                    break;
                }
            }
            if(!hasSigned) {
                res.status(403)
                    .send(`Forbidden`);
                return;
            }
        } else {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        const now = new Date();
        const closingDate = new Date(petitions[0].closing_date);
        const hasClosed = closingDate.getTime() < now.getTime();
        if(hasClosed) {
            res.status(403)
                .send(`Forbidden`);
            return;
        }

        const signedPetitions = await signaturesModel.deleteSignature(currentUser[0].user_id, id);
        res.status( 200 )
            .send( "OK" );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};
