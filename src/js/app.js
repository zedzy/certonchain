App = {
  web3Provider: null,
  contracts: {},
  account: null,
  certIntance: null,
  ipfs:null,
  arrayLength : 0,


  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {

    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }

    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      console.log("localhost7545");
    }
    web3 = new Web3(App.web3Provider);

    var account = App.getAccountParam();

    if (null == account)  {
      console.log("initAccount");
      App.initAccount();
    } else {
      App.account = account;
      console.log("account:" + account);
    }

    return App.initContract();
  },

  initAccount: function() {
    web3.eth.getAccounts(function(error, accounts) {
      App.account = accounts[0];
    });
  },

  initContract: function() {
    $.getJSON('CertContract.json', function(data) {
      App.contracts.certContract = TruffleContract(data);
      App.contracts.certContract.setProvider(App.web3Provider);

      App.contracts.certContract.deployed().then(function(instance) {
        App.certIntance = instance;
        return App.initIPFS();

      });

    });

  },

  initIPFS:function(){
    // ipfs = window.IpfsHttpClient.create({host:'ipfs.infura.io',port: 5001,
    // protocol:'https'});
    ipfs = window.IpfsHttpClient.create({host:'localhost',port: 5001,
    protocol:'http'});
    console.log(ipfs);

    return App.bindEvents();
  },

  bindEvents: function() {

    $("#add_cert").on('click', function() {
      console.log("click add cert");
      var flag=true;
      $('textarea').each(function(){
        var check = this.value;
        if(check.match('/^[ ]*$/')){
          alert("your input exit empty");
          flag=false;
          return false;
        }
      });
      if(flag){
        App.certIntance.uploadermap(App.account).then(function(ca){
          $.getJSON('./json/Cert.json',function(jsonObject){
            jsonObject.cert = $("#new_cert2").val();
            jsonObject.time = $("#new_cert3").val();
            certInfo = JSON.stringify(jsonObject);
            ipfs.add(certInfo).then((response)=>{
              cid = response.cid.toString(); //获取cid，即⽂件标识
              console.log(cid);
              App.certIntance.addCert($("#new_cert1").val(),cid,{from:App.account}).then(function(result) {
                 return App.watchChange();
              }).catch(function (err) {
                console.log(err.message);
              });
            });
          });
        });
      }
    });

  },

  watchChange: function() {
      var infoEvent = App.certIntance.NewCert();
      return infoEvent.watch(function (err, result) {
        console.log("reload");
        window.location.reload();
      });
  },

  getAccountParam: function() {
    var reg = new RegExp("(^|&)account=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
