const signatures = require( '../controllers/petitions.signatures.controller' );

module.exports = function( app ) {
    app.route( '/api/v1/petitions/:id/signatures' )
        .get( signatures.listSignatures )
        .post( signatures.signOnePetition )
        .delete ( signatures.deletOneSignature );
};
