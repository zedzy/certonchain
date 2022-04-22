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

    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error("User denied account access");
      }
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
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

    return App.getCerts();
  },

  getCerts: function() {

        App.certIntance.getCertsLen(App.account).then(function(len) {
          console.log("num of cert:" + len);
          App.arrayLength = len;
          if (len > 0) {
            App.loadCert( len - 1);
          }else{
            alert("number 0f certs:0");
          }

        }).catch(function(err) {
          console.log(err.message);
        });

  },

  loadCert: function(index) {

    App.certIntance.certmap(App.account, index).then(function(cert) {
      cid = cert[2];
      console.log(cid);
      if(cert[1]==true){
        toBuffer(ipfs.cat(cid)).then((bufferedContents)=>{
          certcontent = App.Uint8ArrayToString(bufferedContents);
          certcontent = $.parseJSON(certcontent);
          var certTemplate=$('#certTemplate')
          certTemplate.find('.cert-cert').text(certcontent.cert)
          certTemplate.find('.cert-time').text(certcontent.time)
          certTemplate.find('.cert-category').text(certcontent.category)
          certTemplate.find('.cert-issuer').text(certcontent.issuer)
          certTemplate.find('.cert-uploader').text(cert[0])
          console.log(certTemplate)
          $('#certs').append(certTemplate.html())
          // $("#certs").append(
          // '<div class="form-horizontal"> <div class="form-group"><div class="col-sm-8 col-sm-push-1 ">' +
          // ' <textarea class="form-control" id="cert'+
          // + index
          // + '" >'
          // + certcontent.cert + '\n' +certcontent.time
          // + '</textarea></div>'
          // +  '</div> </div>');

        }).catch(function(err){
          console.log(err.message);
        });
      }
      if (index -1 >= 0) {
        App.loadCert(index - 1);
      }
    } ).catch(function(err) {
      console.log(err.message);
    });

  },

  Uint8ArrayToString: function(fileData){
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
      dataString += String.fromCharCode(fileData[i]);
     }
    return dataString;
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
