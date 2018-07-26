const jwt = require('jsonwebtoken');
const cloudant = require('./cloudant.js');

const auth = {

    login : function(req,res) {

        var username = req.body.username || '';
        var password = req.body.password || '';

        if (username == '' || password == '') {
            res.status(401);
            res.json({
                "status": 401,
                "message": "Entre com o Email e Password."
            });
            return;
        }

        //Fire a query to your DB and check if the credentials are valid
        auth.validate(req,res,function(dbUserObj) {

            if (!dbUserObj) { // If authentication fails, we send a 401 back
                res.status(401);
                res.json({
                    "status": 401,
                    "message": "Credencial Inválida."
                });
                return;
            }

            if (dbUserObj) {
                res.json(genToken(dbUserObj));
            }

        });

    },

    validate : function(req, res , callback ) {

        // spoofing the DB response for simplicity
        var dbUserObj;
        cloudant.login(req,res, function(data) {

            if (data.docs.length!=0 && req.body.username == data.docs[0].nome && req.body.password == data.docs[0].senha ){

                dbUserObj = { // spoofing a userobject from the DB.
                    name: data.docs[0].nome,
                    role: 'admin',
                    username: data.docs[0].nome
                };

                req.session.usuario = dbUserObj;
                callback(dbUserObj);

            } else {
                callback(dbUserObj);
            }
        });
    },
}

function genToken(user) {

    var token = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: user
        },
        require('./secret')()
    );

    return{
        token: token,
        user: user
    }

}

module.exports = auth;