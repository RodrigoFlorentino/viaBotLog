require('dotenv-safe').load();

var Cloudant = require('@cloudant/cloudant');
var cloudant_url = process.env.CLOUDANT_URL;
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var user = process.env.CLOUDANT_USER;
var password = process.env.CLOUDANT_PASSWORD;

if(process.env.VCAP_SERVICES) {

    services = JSON.parse(process.env.VCAP_SERVICES);

    if(services.cloudantNoSQLDB) {
        cloudant_url = services.cloudantNoSQLDB[0].credentials.url;
        user = services.cloudantNoSQLDB[0].credentials.username;
        password = services.cloudantNoSQLDB[0].credentials.password;
    }
}

var cloudantDB = Cloudant({url:cloudant_url, account:user, password:password});
db = cloudantDB.db.use(process.env.CLOUDANT_DB);
dbOutros = cloudantDB.db.use(process.env.CLOUDANT_DBTREINO);
dbUser = cloudantDB.db.use(process.env.CLOUDANT_DBUSER);
dbLogin = cloudantDB.db.use(process.env.CLOUDANT_DBLOGIN);
dbAval = cloudantDB.db.use(process.env.CLOUDANT_AVAL);

var cloudant = {

    get : function(req, res) {

        var id = req.params.id;

        db.get(id, function(err, data) {
            res.status(200).json(data);
        });
    },

    login : function (req,res,callback) {

        var query = { selector: { nome: req.body.username , senha: req.body.password}};

        dbLogin.find(query, function(err, data) {
            if (err) {
                return console.log('error ao buscar usuario', err.message);
            }
            callback(data);
        });
    },

    getChat : function (req, res){

        db.list({include_docs:true},function(err, data) {
            if(err){
                return console.log('[getChat] ', err.message);
                res.status(500);
            }
            res.status(200).json(data);
        });

    },

    getUsuarios : function (req, res){

        dbUser.list({include_docs:true},function(err, data) {
            if(err){
                return console.log('[getOutros] ', err.message);
                res.status(500);
            }
            res.status(200).json(data);
        });

    },

    getOutros : function(req, res){

        dbOutros.list({include_docs:true},function(err, data) {
            if(err){
                return console.log('[getOutros] ', err.message);
                res.status(500);
            }
            res.status(200).json(data);
        });

    },

    atualizaStatusTreinamento : function (req, res){

        var id = req.body.idLog;

        if(req.body.banco == 'chat'){

            db.index( {_id: '_id', type:'json', index:{fields:['_id']}});
            var query = { selector: { _id: id }};

            db.find(query, function(err, data) {

                if (err) {
                    return console.log('[db.atualizaStatusTreinamento] ', err.message);
                    res.status(201).json(err);
                }else{
                    data.docs[0].treinado = true;
                    db.insert(data.docs[0], function(err, data) {
                        if (err) return console.log(err.message);
                        res.status(201).json(data);
                    });

                }

            });

        } else {

            dbOutros.get(id, function(err, data){

                if(err){
                    res.status(201).json(err);
                }else{
                    data.treinado = true;
                    db.insert(data, function(err, data) {
                        if (err) return console.log(err.message);
                        res.status(201).json(data);
                    });
                }
            });

        }
    },

    getInfoData : function (req,res) {

        var dataParam = new Date(req.params.data);
        var data = (dataParam.getMonth() + 1) + '/' + dataParam.getDate() + '/' + dataParam.getFullYear();

        var query = {
            "selector": {
                "dateText": {"$gte" : data}
            },
            "fields": ["dateText","_id"]
        };

        db.index( {dateText: 'dateText', type:'json', index:{fields:['dateText']}});
        db.find(query, function(err, data) {

            if (err) {
                console.log('[db.getInfoData] ', err.message);
                return res.status(401).json(err);
            } else {
                return res.status(201).json(data);
            }
        });

    },

    getInfoMes : function (req,res) {

        var ano = new Date().getFullYear().toString();
        var mesParam = new Date(req.params.mes);

        var query = {
            "selector": {
                "dateText": {
                    "$regex": '/' + mesParam + '/' + ano
                }
            },
            "fields": ["dateText","_id"]
        };

        db.index( {dateText: 'dateText', type:'json', index:{fields:['dateText']}});
        db.find(query, function(err, data) {

            if (err) {
                console.log('[db.getInfoMes] ', err.message);
                return res.status(401).json(err);
            } else {
                return res.status(201).json(data);
            }
        });
    },

    getInfoAno : function (req,res) {

        var ano = new Date().getFullYear().toString();

        var query = {
            "selector": {
                "dateText": {
                    "$regex": ano
                }
            },
            "fields": ["dateText","_id"]
        };

        db.index( {dateText: 'dateText', type:'json', index:{fields:['dateText']}});
        db.find(query, function(err, data) {

            if (err) {
                console.log('[db.getInfoAno] ', err.message);
                return res.status(401).json(err);
            } else {
                return res.status(201).json(data);
            }
        });
    },

    getInfoUser : function (req,res) {

        var dataParam = new Date(req.params.data);
        var data = (dataParam.getMonth() + 1) + '/' + dataParam.getDate() + '/' + dataParam.getFullYear();

        var query = {
            "selector": {
                "data": {"$gte" : data}
            },
            "fields": ["data","_id"]
        };

        dbUser.index( {data: 'data', type:'json', index:{fields:['data']}});
        dbUser.find(query, function(err, data) {

            if (err) {
                console.log('[db.getInfoUser] ', err.message);
                return res.status(401).json(err);
            } else {
                return res.status(201).json(data);
            }
        });

    },

    getInfo : function (req,res) {

        db.list({include_docs:true},function(err, data) {
            if(err){
                return console.log('[getInfoIntent] ', err.message);
                res.status(500);
            }

            res.status(200).json(data);
        });

    },

    getInfoAval : function (req,res) {

        dbAval.list({include_docs:true},function(err, data) {
            if(err){
                return console.log('[getInfoIntent] ', err.message);
                res.status(500);
            }
            res.status(200).json(data);
        });

    }

};

module.exports = cloudant;