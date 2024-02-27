const fs = require("fs");

exports.getImageExtension = function( req ){
    let fileExtension = "";
    const contentType = req.headers['content-type'] || "";
    switch(contentType) {
        case "image/png":{
            fileExtension = ".png";
            break;
        }
        case "image/jpeg": {
            fileExtension = ".jpg";
            break;
        }
        case "image/gif": {
            fileExtension = ".gif";
            break;
        }
        default: {
            break;
        }
    }
    return fileExtension;
};

exports.clearPhotosWithOtherExtensions = function( path, fileName, fileExtention ){

    const pngFile = fileName + ".png";
    const jpgFile = fileName + ".jpg";
    const gifFile = fileName + ".gif";

    switch(fileExtention) {
        case ".png":{
            if(fs.existsSync(path + jpgFile)) {
                fs.unlinkSync(path + jpgFile);
            }
            if(fs.existsSync(path + gifFile)) {
                fs.unlinkSync(path + gifFile);
            }
            break;
        }
        case ".jpeg": {
            if(fs.existsSync(path + pngFile)) {
                fs.unlinkSync(path + pngFile);
            }
            if(fs.existsSync(path + gifFile)) {
                fs.unlinkSync(path + gifFile);
            }
            break;
        }
        case ".gif": {
            if(fs.existsSync(path + pngFile)) {
                fs.unlinkSync(path + pngFile);
            }
            if(fs.existsSync(path + jpgFile)) {
                fs.unlinkSync(path + jpgFile);
            }
            break;
        }
        default: {
            break;
        }
    }
};

exports.getPhotoPathAndContentType = function( rootPath, fileName ) {

    const pngFilePath = rootPath + fileName + '.png';
    const jpgFilePath = rootPath + fileName + '.jpg';
    const jpegFilePath = rootPath + fileName + '.jpeg';
    const gifFilePath = rootPath + fileName + '.gif';

    const pngFileExist = fs.existsSync(pngFilePath);
    const jpgFilePathExist = fs.existsSync(jpgFilePath);
    const jpegFilePathExist = fs.existsSync(jpegFilePath);
    const gifFilePathExist = fs.existsSync(gifFilePath);

    if(pngFileExist) {
        const filePath = pngFilePath;
        const contentType = "image/png";
        return {"filePath": filePath, "contentType": contentType};
    } else if(jpgFilePathExist) {
        const filePath = jpgFilePath;
        const contentType = "image/jpeg";
        return {"filePath": filePath, "contentType": contentType};
    } else if(gifFilePathExist) {
        const filePath = gifFilePath;
        const contentType = "image/gif";
        return {"filePath": filePath, "contentType": contentType};
    } else if(jpegFilePathExist) {
        const filePath = jpegFilePath;
        const contentType = "image/jpeg";
        return {"filePath": filePath, "contentType": contentType};
    } else {
        return {};
    }
}
