var Deploy = require('ftp-deploy');
var ftpDeploy = new Deploy();
 
var config = {
  host: "ftp.innoitlabs.com",
  user: "u680067065.godavarifesh",
  password: "PRzQLeY2WpWUoJi",
  port: 21,
  localRoot: __dirname + "/build",
  remoteRoot: "/",
  include: ["*", ".htaccess"],
  deleteRemote: true,
};
ftpDeploy.deploy(config, function(err, res) {
    if (err) console.log(err)
    else console.log('finished:', res);
});
ftpDeploy.on("uploading", function(data) {
    data.totalFilesCount; 
    data.transferredFileCount;
    data.filename; 
});
ftpDeploy.on("uploaded", function(data) {
    console.log(data); 
});
ftpDeploy.on("log", function(data) {
    console.log(data);
});
ftpDeploy.on("upload-error", function(data) {
    console.log(data.err);
});