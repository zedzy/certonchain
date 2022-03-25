var Cert = artifacts.require("./CertContract.sol");

module.exports = function(deployer) {
  deployer.deploy(Cert);
};
