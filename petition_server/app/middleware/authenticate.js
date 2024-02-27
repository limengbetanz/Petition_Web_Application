const users = require('../models/users.model');

exports.loginRequired = async function(req, res){
    const token = req.header('X-Authorization') || "";
    if(token.length === 0) {
        res.status(401)
            .send(`Unauthorized`);
        return;
    }

    try {
        const currentUser = await users.getByToken(token);
        if(currentUser.length === 0) {
            res.status(401)
                .send(`Unauthorized`);
        } else {
            req.authenticatedUser = currentUser[0].user_id;
            next();
        }
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};
