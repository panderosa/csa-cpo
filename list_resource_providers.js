var async = require("async");
var request = require("request");
var fs = require("fs");



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

var listProviders = function (request,options,providers,userIdentifier,done) {
    var url = "https://stgbeslb001.fabric.local/csa/rest/artifact?userIdentifier=" + userIdentifier + "&artifactType=RESOURCE_PROVIDER&restrict=false";

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
            done(null,userIdentifier,ids);
        }
        else {
            done(error,null);
        }
    });
}; 

var getAPs = function (request,options,userIdentifier,ids,done) {
    var array = [];
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
                    done(null,userIdentifier,aps);
                }
            }
            else {
                done(error,null);
            }
        });
    });
};

var getProperties = function (request,options,userIdentifier,aps,done) {
    var array = [];
    var urls = aps.map(ap => {
        ap.url = "https://stgbeslb001.fabric.local/csa/rest/artifact/" + ap.objectId + "/resolveProperties?userIdentifier=" + userIdentifier + "&view=propertyvalue";
        return ap;
    });
    var completed_requests = 0;

    var naps = [];
    urls.forEach(e => {
        request.get(e.url,options,(error,response,body) => {
            if( !error || response.statusCode === 200 ) {               
                var props = JSON.parse(body).property;
                var sprops = props.map(p => {
                    return {
                        name: p.name,
                        type: p.valueType.name,
                        value: (p.values.length > 0)? p.values[0].value: null
                    };
                });

                naps.push({
                    "name": e.name,
                    "sap": e.sap,
                    "properties": sprops
                });
                if( completed_requests++ === urls.length -1 ) {
                    //console.log("A: " + JSON.stringify(aps,null,2));
                    done(null,naps);
                }
            }
            else {
                done(error,null);
            }
        });
    });
};

var printId = function (naps) {
    console.log(JSON.stringify(naps,null,2));
};

var storeInFile = function(fs,filename,naps) {
    var content = JSON.stringify(naps,null,2);
    fs.writeFileSync(fileName, content,'utf-8','w');
}



const options = {
        rejectUnauthorized: false,
        agent: false,
        method: "GET",
        headers: { 
            "Accept": "application/json", 
            "Authorization": "Basic " + Buffer.from("ooInboundUser:jT==UiN1QpKsL00=").toString("base64") 
        }
}


var providers = [
    'Ansible',
    'CPO - INFRA Database',
    'Microsoft SCVMM',
];

var fileName = "c:/tmp/providers.json";
var tasks = [
    async.apply(getUserIdentifier,request,options),
    async.apply(listProviders,request,options,providers),
    async.apply(getAPs,request,options),
    async.apply(getProperties,request,options),
    async.apply(storeInFile,fs,fileName)
];
async.waterfall(tasks, cb);