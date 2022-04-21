App = {
  web3Provider: null,
  contracts: {},
  account: null,
  certIntance: null,
  ipfs:null,
  address: null,

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

    return App.bindEvents();
  },

  bindEvents: function() {

    $("#search").on('click', function(){
      $('#certs').remove();
      $('.row').append('<div id="certs" ></div>');
      var check = $('#address').val();
      if(check.match(/^[ ]*$/)){
        alert("your input exit empty");
        return false;
      }else {
        App.address = $('#address').val();
        App.certIntance.getCertsLen(App.address).then(function(len) {
          // console.log("num of cert:" + len);
          if (len > 0) {
            App.loadCert( len - 1);
          }

        }).catch(function(err) {
          console.log(err.message);
        });
      }

    });

  },

  watchChange: function() {
      var infoEvent = App.certIntance.CancelCert();
      return infoEvent.watch(function (err, result) {
        console.log("reload");
        window.location.reload();
      });
  },

  adjustHeight: function() {
    // console.log("reset height");

      $("[name^=cancel]").on('click', function(){
        console.log(this.value);
        App.certIntance.cancel(App.address,this.value,{from:App.account}).then(function(result){
          return App.watchChange();
        }).catch(function (err) {
          console.log(err.message);
        });
      });

  },

  loadCert: function(index) {
    App.certIntance.certmap(App.address, index).then(function(cert) {
      cid = cert[2];
      // console.log(App.account)
      //console.log(cert[1])
      if(cert[0]==App.account){
        //console.log(cid);
        toBuffer(ipfs.cat(cid)).then((bufferedContents)=>{
          certcontent = App.Uint8ArrayToString(bufferedContents);
          certcontent = $.parseJSON(certcontent);
          var certTemplate=$('#certTemplate')
          certTemplate.find('.cert-cert').text(certcontent.cert)
          certTemplate.find('.cert-time').text(certcontent.time)
          certTemplate.find('.cert-category').text(certcontent.category)
          certTemplate.find('.cert-issuer').text(certcontent.issuer)
          certTemplate.find('.cert-uploader').text(cert[0])
          certTemplate.find('.cert-effective').text(cert[1])
          certTemplate.find('.btn-cancel').attr('name','cancel'+index)
          certTemplate.find('.btn-cancel').attr('value',index)
          // console.log(certTemplate)
          $('#certs').append(certTemplate.html())
          // $("#certs").append(
          // '<div class="form-horizontal"> <div class="form-group"><div class="col-sm-8 col-sm-push-1 ">' +
          // ' <textarea class="form-control" id="cert'+
          // + index
          // + '" >'
          // + certcontent.cert + '\n' +certcontent.time + '\n' +cert[1]
          // + '</textarea></div>'
          // + '<button class="btn btn-primary col-sm-1 col-sm-push-1" name="cancel'+index+'" value='+index+'>cancel</button>'
          // +  '</div> </div>');
          App.adjustHeight();

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
