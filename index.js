const express = require('express');
const msRestAzure = require('ms-rest-azure');
const KeyVault = require('azure-keyvault');
const KEY_VAULT_URI = null || process.env[KEY_VAULT_URI];
require('dotenv').config();

let app = express();
let clientId = process.env.CLIENT_ID; // service principal
let domain = process.env.DOMAIN; // tenant id
let secret = process.env.APPLICATION_SECRET;
//process.env['MSI_SECRET'] = secret;

function getKeyVaultCredentials(){
  if (process.env.APPSETTING_WEBSITE_SITE_NAME){
    console.log("Here 1");
    return msRestAzure.loginWithAppServiceMSI({resource: 'https://vault.azure.net'});
  } else {
    return msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain);
  }
}

function getKeyVaultSecret(credentials) {
  console.log("Here 3 " + credentials);
  let keyVaultClient = new KeyVault.KeyVaultClient(credentials);
  return keyVaultClient.getSecret(KEY_VAULT_URI, 'secret', "");
}

app.get('/ad', function (req, res) {
  console.log("Here 2 : " + KEY_VAULT_URI);
  getKeyVaultCredentials().then(getKeyVaultSecret).then(function (secret){
    console.log("Here 4");
    res.send(`Your secret value is: ${secret.value}.`);
  }).catch(function (err) {
    console.log("err: " + err);
    res.send(err);
  });
});

app.get('/ping', function (req, res) {
  res.send('Hello World!!!');
});

let port = process.env.PORT || 8080;

app.listen(port, function () {
  console.log(`Server running at http://localhost:${port}`);
});
