const users = require( '../controllers/users.controller' );

module.exports = function( app ) {
    app.route( '/api/v1/users/register' )
        .post( users.register );
    app.route( '/api/v1/users/login' )
        .post( users.login );
    app.route( '/api/v1/users/logout' )
        .post( users.logout );
    app.route( '/api/v1/users/:id' )
        .get( users.get )
        .patch(users.update);
};