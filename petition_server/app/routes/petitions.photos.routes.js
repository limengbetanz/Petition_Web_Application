const photos = require( '../controllers/petitions.photos.controller' );

module.exports = function( app ) {
        app.route( '/api/v1/petitions/:id/photo' )
        .get( photos.getPetitionHeroImage )
        .put( photos.uploadPetitionHeroImage );
};