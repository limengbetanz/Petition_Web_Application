const petitionsModel = require('../models/petitions.model');
const usersModel = require('../models/users.model');
const signatureModel = require('../models/petitions.signatures.model');
const categoryModel = require('../models/category.model');

const INVALID_TOKEN = "invalid_token";

exports.getPetitions = async function(req, res){
    console.log( '\nRequest to list petitions...' );

    try {
        let filteredResults = [];

        const startIndex = parseInt(req.query.startIndex) || 0;
        let count = parseInt(req.query.count) || 0;
        const q = req.query.q || "";
        const categoryId = req.query.categoryId || "";
        const authorId = req.query.authorId || "";
        const sortBy = req.query.sortBy || "SIGNATURES_DESC";

        if(startIndex < 0 || count < 0) {
            res.status(400)
                .send(`Bad Request`);
            return;
        }

        const sortStrategies = ["ALPHABETICAL_ASC", "ALPHABETICAL_DESC", "SIGNATURES_ASC", "SIGNATURES_DESC"];
        if(!sortStrategies.includes(sortBy)) {
            res.status(400)
                .send(`Bad Request`);
            return;
        }

        let filteredPetitions = await petitionsModel.getPetitionsByMultiContitions(startIndex, count, q, categoryId, authorId);

        if(q.length !== 0) {
            filteredPetitions = filteredPetitions.filter(petition => petition.title.toLowerCase().includes(q.toLowerCase()));
        }

        if(categoryId.length !== 0) {
            filteredPetitions = filteredPetitions.filter(petition => petition.category_id == categoryId);
        }

        if(authorId.length !== 0) {
            filteredPetitions = filteredPetitions.filter(petition => petition.author_id == authorId);
        }

        let result = [];
        for(const petition of filteredPetitions) {
            let isDuplicated = false;
            let currentPetitionInResult;
            for(const itemInResult of result) {
                if(itemInResult.petitionId == petition.petition_id){
                    isDuplicated = true;
                    currentPetitionInResult = itemInResult;
                    break;
                }
            }

            if(isDuplicated) {
                currentPetitionInResult["signatureCount"] += 1;
            } else {
                let item = {};
                item["petitionId"] = petition.petition_id;
                item["title"] = petition.title;
                item["category"] = petition.category_name;
                item["authorName"] = petition.user_name
                item["signatureCount"] = 1;
                result.push(item);
            }
        }

        // sort results
        switch(sortBy) {
            case "ALPHABETICAL_ASC":
                result.sort(function (a, b) {
                    return a.title > b.title ? 1 : -1;
                });
                break;
            case "ALPHABETICAL_DESC":
                result.sort(function (a, b) {
                    return a.title > b.title ? -1 : 1;
                });
                break;
            case "SIGNATURES_ASC":
                result.sort(function (a, b) {
                    return a.signatureCount - b.signatureCount;
                });
                break;
            case "SIGNATURES_DESC":
                result.sort(function (a, b) {
                    return b.signatureCount - a.signatureCount;
                });
                break;
        }

        if(startIndex < result.length) {
            if(count !== 0) {
                const remainingPetitions = result.length - startIndex;
                count = remainingPetitions > count ? count : remainingPetitions;
                result = result.slice(startIndex, startIndex + count);
            } else {
                result = result.slice(startIndex, result.length);
            }
        }

        res.status( 200 ).set({ 'content-type': 'application/json; charset=utf-8' })
            .send( JSON.stringify(result) );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.createPetition = async function(req, res){
    console.log( '\nRequest to create a new petition...' );

    try {
        const token = req.header('X-Authorization') || INVALID_TOKEN;
        if(token === INVALID_TOKEN) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        const title = req.body.title || "";
        const description = req.body.description || "";
        const categoryId = req.body.categoryId || "";
        const closingDate = req.body.closingDate || "";

        if(title.length === 0 || description.length === 0 || categoryId.length === 0 || closingDate.length === 0) {
            res.status( 400 )
                .send( 'Bad Request' );
            return;
        }

        const currentUser = await usersModel.getByToken(token);
        if(currentUser.length === 0) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        const nowTime = new Date().getTime();
        const closingDateTime = new Date(closingDate).getTime();
        if(closingDateTime < nowTime) {
            res.status( 400 )
                .send( 'Bad Request' );
            return;
        }

        const categories = await categoryModel.getCategory(categoryId);
        if(categories.length === 0) {
            res.status( 400 )
                .send( 'Bad Request' );
            return;
        }

        const createdDate = new Date().toISOString().substr(0, 19).replace('T', ' ');
        await petitionsModel.insertPetition( title, description, currentUser[0].user_id, categoryId, createdDate, closingDate);
        const newPetition = await petitionsModel.getPetitionByAuthorIdAndCreateDate(currentUser[0].user_id, createdDate);
        const result = {"petitionId": newPetition[0].petition_id};

        res.status( 201 ).set({ 'content-type': 'application/json; charset=utf-8' })
            .send( JSON.stringify(result) );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.getPetition = async function(req, res){
    console.log( '\nRequest to get a petition...' );

    try {
        const petitionId = req.params.id;
        const petitions = await petitionsModel.getPetitionByPetitionId_v2(petitionId);

        if(petitions.length == 0) {
            res.status(404)
                .send(`Not Found`);
        } else {
            let petition = {};
            petition["petitionId"] = petitions[0].petition_id;
            petition["title"] = petitions[0].title;
            petition["category"] = petitions[0].category_name;
            petition["authorName"] = petitions[0].author_name;
            petition["description"] = petitions[0].description;
            petition["authorId"] = petitions[0].author_id;
            petition["authorCity"] = petitions[0].city || "";
            petition["authorCountry"] = petitions[0].country || "";

            let created_date = petitions[0].created_date;
            created_date = new Date(created_date).toISOString();
            let closing_date = petitions[0].closing_date;
            closing_date = new Date(closing_date).toISOString();

            petition["createdDate"] = created_date;
            petition["closingDate"] = closing_date;

            const signatories = await signatureModel.getSignatoriesByPetitionId(petitionId);
            petition["signatureCount"] = signatories.length;

            res.status( 200 ).set({ 'content-type': 'application/json; charset=utf-8' })
                .send( JSON.stringify(petition) );
        }
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.updatePetition = async function( req, res ) {
    console.log( '\nRequest to update a petition...' );

    const id = req.params.id;

    try {
        const token = req.header('X-Authorization') || INVALID_TOKEN;
        if(token === INVALID_TOKEN) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        let title = req.body.title || "";
        let description = req.body.description || "";
        let categoryId = parseInt(req.body.categoryId) || 0;
        let closingDate = req.body.closingDate || "";

        if(categoryId < 0) {
            res.status( 400 )
                .send( 'Bad Request' );
            return;
        }

        const currentUser = await usersModel.getByToken(token);
        if(currentUser.length === 0) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        const nowTime = new Date().getTime();
        if(closingDate.length !== 0) {
            const closingDateTime = new Date(closingDate).getTime();
            if(closingDateTime < nowTime) {
                res.status( 403 )
                    .send( 'Forbidden' );
                return;
            }
        }

        if(categoryId > 0) {
            const categories = await categoryModel.getCategory(categoryId);
            if(categories.length === 0) {
                res.status( 404 )
                    .send( 'Not Found' );
                return;
            }
        }

        const petitions = await petitionsModel.getPetitionByPetitionId(id);
        if(petitions.length === 0) {
            res.status( 404 )
                .send( 'Not Found' );
            return;
        }

        const oldClosingDate = petitions[0].closing_date || "";
        if(oldClosingDate.length !== 0) {
            const oldClosingDateTime = new Date(oldClosingDate).getTime();
            if(oldClosingDateTime < nowTime) {
                res.status( 403 )
                    .send( 'Forbidden' );
                return;
            }
        }

        if(petitions[0].author_id != currentUser[0].user_id) {
            res.status( 403 )
                .send( 'Forbidden' );
            return;
        }

        if(title.length === 0) {
            title = petitions[0].title;
        }

        if(description.length === 0) {
            description = petitions[0].description;
        }

        if(categoryId === 0) {
            categoryId = petitions[0].category_id;
        }

        if(closingDate.length === 0) {
            closingDate = petitions[0].closing_date;
        }

        await petitionsModel.updatePetition( id, title, description, categoryId, closingDate);
        res.status( 200 )
            .send( "OK" );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.deletePetition = async function( req, res ) {
    console.log( '\nRequest to delete a petition...' );

    const id = req.params.id;

    try {
        const token = req.header('X-Authorization') || INVALID_TOKEN;
        if(token === INVALID_TOKEN) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        const currentUser = await usersModel.getByToken(token);
        if(currentUser.length === 0) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        const petitions = await petitionsModel.getPetitionByPetitionId(id);
        if(petitions.length === 0) {
            res.status( 404 )
                .send( 'Not Found' );
            return;
        }

        if(petitions[0].author_id != currentUser[0].user_id) {
            res.status( 403 )
                .send( 'Forbidden' );
            return;
        }

        await petitionsModel.deletePetition(id);
        await signatureModel.deleteSignatures(id);

        res.status( 200 )
            .send( "OK" );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.getCategories = async function(req, res){
    console.log( '\nRequest to list categories...' );

    try {
        const categories = await categoryModel.getCategories();

        let result = [];
        for(const category of categories) {
            let item = {};
            item["categoryId"] = category.category_id;
            item["name"] = category.name;
            result.push(item);
        }

        res.status( 200 ).set({ 'content-type': 'application/json; charset=utf-8' })
            .send( JSON.stringify(result) );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};
