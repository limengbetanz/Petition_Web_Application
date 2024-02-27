const userPhotos = require( '../controllers/users.photos.controller' );

module.exports = function( app ) {
    app.route( '/api/v1/users/:id/photo' )
        .get( userPhotos.get )
        .put( userPhotos.upload )
        .delete( userPhotos.delete );
};
