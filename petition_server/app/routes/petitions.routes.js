const petitions = require( '../controllers/petitions.controller' );

module.exports = function( app ) {
    app.route( '/api/v1/petitions/categories' )
        .get( petitions.getCategories );
    app.route( '/api/v1/petitions' )
        .get( petitions.getPetitions )
        .post( petitions.createPetition);
    app.route( '/api/v1/petitions/:id' )
        .get( petitions.getPetition )
        .delete( petitions.deletePetition)
        .patch( petitions.updatePetition);
};