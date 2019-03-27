var request = require("request");
var fs = require("fs");

var auth = "Basic " + Buffer.from("ooInboundUser:jT==UiN1QpKsL00=").toString("base64");

var url = "https://stgbeslb001.fabric.local/csa/rest/login/CSA-Provider/ooInboundUser";
var options = {
    host: "stgbeslb001.fabric.local",
    port: 443,
    path: "",
    rejectUnauthorized: false,
    agent: false,
    method: "",
    headers: {} 
};

var mf = function(err,body) {
    var id = null;
    if(err) {
        console.log(err);
    }
    else {
        //console.log(body);
        id = JSON.parse(body).id;
        console.log("S " + id);
    }
    return id;
}

function getUserIdentifier(request,url,options,mf) {
    var userId = null;
    var headers = { 
        "Accept": "application/json", 
        "Authorization": auth 
    };

    options['method'] = 'GET';
    options.headers = headers;
    options.path = "/csa/rest/login/CSA-Provider/ooInboundUser";
    //console.log(options);
    request.get(url,options,(error,response,body) => {
        if( !error || response.statusCode === 200 ) {
            userId = mf(null,body);
            console.log("M " + userId);
        }
        else {
            mf(error,null);
        }
    });
    
    return userId;
}

userId = getUserIdentifier(request,url,options,mf);
console.log("E " + userId);

