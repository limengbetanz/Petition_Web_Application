const usersModel = require('../models/users.model');
const petitionsModel = require('../models/petitions.model');
const controllerUtility = require('../controllers/controller.utility');
const fs = require("fs");

const INVALID_TOKEN = "invalid_token";

exports.getPetitionHeroImage = async function(req, res){
    console.log( '\nRequest to get petition\'s hero image...' );

    const id = parseInt(req.params.id) || 0;

    try {
        const petitions = await petitionsModel.getPetitionByPetitionId(id);
        if(petitions.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        const photoFileName = petitions[0].photo_filename || "";
        if(photoFileName.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        const rootPath = "./storage/photos/";
        const fileName =  "petition_" + id;
        const photoPathAndContentType = controllerUtility.getPhotoPathAndContentType(rootPath, fileName);
        const filePath = photoPathAndContentType.filePath || "";
        const contentType = photoPathAndContentType.contentType || "";
        if(filePath.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        res.status( 200 ).set({ 'content-type': contentType})
            .sendfile(filePath);
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.uploadPetitionHeroImage = async function(req, res){
    console.log( '\nRequest to sign a petition with a given petition id...' );

    const id = req.params.id || 0;

    const token = req.header('X-Authorization') || INVALID_TOKEN;
    if(token === INVALID_TOKEN) {
        res.status(401)
            .send(`Unauthorized`);
        return;
    }

    let fileExtension = controllerUtility.getImageExtension(req);
    if(fileExtension.length === 0) {
        res.status(400)
            .send(`Bad Request`);
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

        if(petitions[0].author_id != currentUser[0].user_id) {
            res.status(403)
                .send(`Forbidden`);
            return;
        }

        const rootPath = "./storage/photos/";
        const fileNameWithoutExtension = "petition_" + id;
        const fileName = fileNameWithoutExtension + fileExtension;
        const fileNamePath = rootPath + fileName;

        if (fs.existsSync(fileNamePath)) {
            fs.unlinkSync(fileNamePath);
            fs.writeFileSync(fileNamePath, req.body);
            res.status(200)
                .send(`OK`);
            //req.pipe(fs.createWriteStream(fileNamePath));
            //req.on('end', function () {
                //res.status( 200 ).send(`OK`);
            //});
        } else {
            controllerUtility.clearPhotosWithOtherExtensions(rootPath, fileNameWithoutExtension, fileExtension);
            await petitionsModel.updatePhotoName(id, fileName);
            fs.writeFileSync(fileNamePath, req.body);
            res.status(201)
                .send(`Created`);
            //req.pipe(fs.createWriteStream(fileNamePath));
            //req.on('end', function () {
                //res.status( 201 ).send(`Created`);
            //});
        }
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};
