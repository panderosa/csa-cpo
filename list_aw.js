var async = require("async");
const request = require("request");



var cb = function(err,result) {
    if(err) {
        console.log(err);
    }
    else {
        return result;
    }
}

var getUserIdentifier = function (request,options,done) {
    var url = "https://stgbeslb001.fabric.local/csa/rest/login/CSA-Provider/ooInboundUser";
    
    request.get(url,options,(error,response,body) => {
        if( !error || response.statusCode === 200 ) {
            var id = JSON.parse(body).id;
            done(null,id);
        }
        else {
            done(error,null);
        }
    });
};

var listOfferingsInCatalog = function (request,options,catalogId,userIdentifier,done) {
    var url = "https://stgbeslb001.fabric.local/csa/rest/catalog/" + catalogId + "/offering?userIdentifier=" + userIdentifier;

    request.get(url,options,(error,response,body) => {
        if( !error || response.statusCode === 200 ) {
            var offerings = JSON.parse(body).serviceOffering;
            var ids = offerings.map(e => {
                return e.id;
            });
            done(null,userIdentifier,ids);
        }
        else {
            done(error,null);
        }
    });
};

var listDesigns = function (request,options,catalogId,userIdentifier,ids,done) {
    var array = [];
    var urls = ids.map(oid => {
        return "https://stgbeslb001.fabric.local/csa/rest/catalog/" + catalogId + "/offering/" + oid + "?userIdentifier=" + userIdentifier + "&detail=standard";
    });
    var completed_requests = 0;
    var sb = [];

    urls.forEach(url => {
        request.get(url,options,(error,response,body) => {
            if( !error || response.statusCode === 200 ) {
                var blueprint = JSON.parse(body).serviceBlueprint.id;
                sb.push(blueprint);
                if( completed_requests++ === urls.length -1 ) {
                    done(null,sb);
                }
            }
            else {
                done(error,null);
            }
        });
    });
};

var printId = function (ids) {
    console.log(ids);
};

const options = {
        rejectUnauthorized: false,
        agent: false,
        method: "GET",
        headers: { 
            "Accept": "application/json", 
            "Authorization": "Basic " + Buffer.from("ooInboundUser:jT==UiN1QpKsL00=").toString("base64") 
        }
}


var catalogId = '2c90ce8967360052016739af86bc4bdc';
var tasks = [
    async.apply(getUserIdentifier,request,options),
    async.apply(listOfferingsInCatalog,request,options,catalogId),
    async.apply(listDesigns,request,options,catalogId),
    printId
];
async.waterfall(tasks, cb);