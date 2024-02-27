const users = require('../models/users.model');
const INVALID_TOKEN = "invalid_token";

exports.register = async function(req, res){
    console.log( '\nRequest to register user...' );

    const name = req.body.name || "";
    const email = req.body.email || "";
    const password = req.body.password || "";
    const city = req.body.city || null;
    const country = req.body.country || null;

    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isValid = re.test(String(email).toLowerCase());

    if(name.length === 0 || password.length === 0 || !isValid) {
        res.status(400)
            .send(`Bad Request`);
        return;
    }

    try {
        const user = await users.getByMail(email);
        if(user.length !== 0) {
            res.status(400)
                .send(`Bad Request`);
            return;
        }

        await users.create(name, email, password, city, country);
        const newUser = await users.getByMail(email);

        const result = {"userId": newUser[0].user_id};
        res.status( 201 ).set({ 'content-type': 'application/json; charset=utf-8' })
            .send( JSON.stringify(result) );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.login = async function(req, res){
    console.log( '\nRequest to login ...' );

    const email = req.body.email || "";
    const password = req.body.password || "";

    if(email.length === 0 || password.length === 0) {
        res.status(400)
            .send(`Bad Request`);
        return;
    }

    try {
        const user = await users.login(email, password);
        if(user.length === 0) {
            res.status(400)
                .send(`Bad Request`);
            return;
        }

        const result = {"userId": user[0].user_id, "token": user[0].auth_token};
        res.status( 200 ).set({ 'content-type': 'application/json; charset=utf-8' })
            .send( JSON.stringify(result) );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.logout = async function(req, res){
    console.log( '\nRequest to logout ...' );

    const token = req.header('X-Authorization') || INVALID_TOKEN;
    if(token === INVALID_TOKEN) {
        res.status(401)
            .send(`Unauthorized`);
        return;
    }

    try {
        const user = await users.getByToken(token);
        if(user.length === 0) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        await users.logout(token);
        res.status( 200 )
            .send( `OK` );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.get = async function(req, res){
    console.log( '\nRequest to get a user ...' );

    const id = req.params.id;
    const token = req.header('X-Authorization') || INVALID_TOKEN;

    try {
        const userWithGivenId = await users.getById(id);
        if(userWithGivenId.length === 0) {
            res.status(404)
                .send(`Not Found`);
            return;
        }

        const result = {"name": userWithGivenId[0].name, "city": userWithGivenId[0].city || "", "country": userWithGivenId[0].country || ""};

        if(token !== INVALID_TOKEN) {
            const currentUser = await users.getByToken(token);
            if(currentUser.length === 0) {
                res.status(404)
                    .send(`Not Found`);
                return;
            } else {
                if(currentUser[0].user_id == id) {
                    result["email"] = userWithGivenId[0].email;
                }
            }
        }

        res.status( 200 ).set({ 'content-type': 'application/json; charset=utf-8' })
            .send( JSON.stringify(result) );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};

exports.update = async function(req, res){
    console.log( '\nRequest to update partial information of a user ...' );

    const id = req.params.id;

    let name = req.body.name || "";
    let email = req.body.email || "";
    let password = req.body.password || "";
    const currentPassword = req.body.currentPassword || "";
    let city = req.body.city || "";
    let country = req.body.country || "";

    const token = req.header('X-Authorization') || "";
    if(token.length === 0) {
        res.status(401)
            .send(`Unauthorized`);
        return;
    }

    if(password.length === 0) {
        res.status(400)
            .send(`Bad Request`);
        return;
    }

    if(email.length !== 0) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const isValid = re.test(String(email).toLowerCase());
        if(!isValid) {
            res.status(400)
                .send(`Bad Request`);
            return;
        }
    }

    try {
        const currentUser = await users.getByToken(token);
        if(currentUser.length === 0) {
            res.status(401)
                .send(`Unauthorized`);
            return;
        }

        if(currentUser[0].password !== password) {
            if(currentPassword.length === 0) {
                res.status(400)
                    .send(`Bad Request`);
                return;
            } else {
                if(currentUser[0].password !== currentPassword) {
                    res.status(400)
                        .send(`Bad Request`);
                    return;
                }
            }
        }

        if(currentUser[0].user_id != id) {
            res.status(403)
                .send(`Forbidden`);
            return;
        }

        if(name.length === 0) {
            name = currentUser[0].name;
        }

        if(city.length === 0) {
            city = currentUser[0].city;
        }

        if(country.length === 0) {
            country = currentUser[0].country;
        }

        if(email.length == 0) {
            email = currentUser[0].email;
        }

        await users.updateInfo(name, email, password, city, country, token);

        res.status( 200 )
            .send( `OK` );
    } catch( err ) {
        res.status( 500 )
            .send( `Internal Server Error` );
    }
};
