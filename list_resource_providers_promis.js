let request = require("request");
let fs = require("fs");
let userIdentifier = null;

let options = {
    rejectUnauthorized: false,
    agent: false,
    method: "GET",
    headers: { 
        "Accept": "application/json", 
        "Authorization": "Basic " + Buffer.from("ooInboundUser:jT==UiN1QpKsL00=").toString("base64") 
    }
}

let providers = [
    'Ansible',
    'CPO - INFRA Database',
    'Microsoft SCVMM',
];

let CSA_REST_URL = "https://stgbeslb001.fabric.local/csa/rest";


var getUserIdentifier = function () {
    var url = CSA_REST_URL + "/login/CSA-Provider/ooInboundUser";
    return new Promise((resolve, reject) => {
        request.get(url,options,(error,response,body) => {     
            if( !error || response.statusCode === 200 ) {
                userIdentifier = JSON.parse(body).id;
                resolve();
            }
            else {
                reject(error);
            }
        });
    });
};

var listProviders = function () {
    var url = CSA_REST_URL + "/artifact?userIdentifier=" + userIdentifier + "&artifactType=RESOURCE_PROVIDER&restrict=false";
    return new Promise((resolve, reject) => {
        request.get(url,options,(error,response,body) => {
            if( !error || response.statusCode === 200 ) {
                var array = JSON.parse(body).resourceProvider;
                var ids = array.filter(e => {
                    return !e.disabled && providers.includes(e.name);
                }).map(e => {
                    return {
                        "objectId": e.id,
                        "name": e.name
                    }
                });
                resolve(ids);
            }
            else {
                reject(error);
            }
        });
    });
}; 


var getAPS = function (ids) {
    var array = [];
    return new Promise((resolve, reject) => {
        var urls = ids.map(e => {
            return {
                "objectId": e.objectId,
                "name": e.name,
                "url": "https://stgbeslb001.fabric.local/csa/rest/artifact/fastview/" + e.objectId + "?userIdentifier=" + userIdentifier + "&view=accesspoint"
            };
        });
        var completed_requests = 0;

        var aps = [];
        urls.forEach(e => {
            request.get(e.url,options,(error,response,body) => {
                if( !error || response.statusCode === 200 ) {
                    aps.push({
                        "name": e.name,
                        "objectId": e.objectId,
                        "sap": JSON.parse(body).resultMap
                    });
                    if( completed_requests++ === urls.length -1 ) {
                        //console.log("A: " + JSON.stringify(aps,null,2));
                        resolve(aps);
                    }
                }
                else {
                    reject(error);
                }
            });
        });
    });
};

var print = function(input) {
    console.log(JSON.stringify(input,null,2));
}

var onError = function(error) {
    console.log(error);
}


getUserIdentifier().then(listProviders).then(getAPS).then(print).catch(onError);