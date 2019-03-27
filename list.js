const https = require("https");
var fs = require("fs");
//var auth = Buffer.from("Basic ooInboundUser:jT==UiN1QpKsL00=").toString("base64");
var auth = "Basic b29JbmJvdW5kVXNlcjpqVD09VWlOMVFwS3NMMDA9";

var url = "https://stgbeslb001.fabric.local/csa/rest/login/CSA-Provider/ooInboundUser";
const options = {
    host: "stgbeslb001.fabric.local",
    port: 443,
    path: "/csa/rest/login/CSA-Provider/ooInboundUser",
    rejectUnauthorized: false,
    agent: false,
    ca: fs.readFileSync("C:/Users/dm.microfocus/csa-rp/csa.cer"),
    method: "GET",
    headers: { "Accept": "application/json", "Authorization": auth }
};
//process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var req = https.request(options, (res) => {
    var data = "";
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on("error", (err) => {
        console.log("Error: " + err.code);
    });

    res.on("data", (chunk) => {
        //data += chunk;
        console.log("chunk");
    });

    res.on("end", () => {
        console.log("END");
    });

});

req.on("error",(err) => {
    console.log(err);
});

