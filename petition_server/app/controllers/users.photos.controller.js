const users = require('../models/users.model');
const controllerUtility = require('../controllers/controller.utility');
const fs = require("fs");
const INVALID_TOKEN = "invalid_token";

exports.get = async function(req, res){
    console.log( '\nRequest to get a users profile photo ...' );

    const id = req.params.id;
    try {
        const currentUser = await users.getById(id);
        if(currentUser.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        const photoFileName = currentUser[0].photo_filename || "";
        if(photoFileName.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        const rootPath = "./storage/photos/";
        const fileName =  "user_" + id;
        const photoPathAndContentType = controllerUtility.getPhotoPathAndContentType(rootPath, fileName);
        const filePath = photoPathAndContentType.filePath || "";
        const contentType = photoPathAndContentType.contentType || "";
        if(filePath.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        res.status( 200 ).contentType(contentType)
            .sendfile(filePath);
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.upload = async function(req, res){
    console.log( '\nRequest to upload users profile photo ...' );

    const id = req.params.id;

    const token = req.header('X-Authorization') || INVALID_TOKEN;
    if(token === INVALID_TOKEN) {
        res.status(401)
            .send(`Unauthorized`);
        return;
    }

    try {
        let fileExtension = controllerUtility.getImageExtension(req);
        if(fileExtension.length === 0) {
            res.status(400)
                .send(`Bad Request`);
            return;
        }

        const currentUser = await users.getByToken(token);
        if(currentUser.length === 0) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        const userWithGivenId = await users.getById(id);
        if(userWithGivenId.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        if(currentUser[0].user_id != id) {
            res.status(403)
                .send(`Forbidden`);
            return;
        }

        const rootPath = "./storage/photos/";
        const fileNameWithoutExtension = "user_" + id;
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
            await users.updatePhotoName(id, fileName);
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

exports.delete = async function(req, res){
    console.log( '\nRequest to delete users profile photo  ...' );

    const id = req.params.id;
    const token = req.header('X-Authorization') || INVALID_TOKEN;
    if(token === INVALID_TOKEN) {
        res.status(401)
            .send(`Unauthorized`);
        return;
    }

    try {
        const currentUser = await users.getByToken(token);
        if(currentUser.length === 0) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        const userWithGivenId = await users.getById(id);
        if(userWithGivenId.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        if(currentUser[0].user_id != id) {
            res.status(403)
                .send(`Forbidden`);
            return;
        }

        const fileName = currentUser[0].photo_filename || "";
        if(fileName.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        const fileNamePath = "./storage/photos/" + fileName;
        if (fs.existsSync(fileNamePath)) {
            fs.unlinkSync(fileNamePath);
            await users.updatePhotoName(id, null);
            res.status(200)
                .send("OK");
        } else {
            res.status(404)
                .send(`Not Found`);
        }
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};
