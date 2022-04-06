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
    ipfs = window.IpfsHttpClient.create({host:'ipfs.infura.io',port: 5001,
    protocol:'https'});
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
        App.certIntance.camap(App.account).then(function(ca){
          $.getJSON('./json/Cert.json',function(jsonObject){
            jsonObject.certid = $("#new_cert1").val();
            jsonObject.id = $("#new_cert2").val();
            jsonObject.name = $("#new_cert3").val();
            jsonObject.time = $("#new_cert4").val();
            jsonObject.ca = ca[0];
            certInfo = JSON.stringify(jsonObject);
            ipfs.add(certInfo).then((response)=>{
              cid = response.cid.toString(); //获取cid，即⽂件标识
              console.log(cid);
              App.certIntance.addCert($("#new_cert2").val(),$("#new_cert3").val(),cid,{from:App.account}).then(function(result) {
                 return App.watchChange("cert");
              }).catch(function (err) {
                console.log(err.message);
              });
            });
          });
        });
      }

    });

    $("#add_ca").on('click', function() {
      console.log("click add ca");
      var check = $("#new_ca").val();
      if(check.match('/^[ ]*$/'))alert("your input exit empty");
      else{
        App.certIntance.addCA($("#new_ca").val(),{from:App.account}).then(function(result) {
           return App.watchChange("ca");
        }).catch(function (err) {
          console.log(err.message);
        });
      }

    });


    // $("#notes").on('click', "button", function() {
    //   var cindex = $(this).attr("index");
    //   var noteid = "#note" + cindex
    //   var note = $(noteid).val();
    //   console.log(noteid);
    //   console.log(note);
    //
    //
    //   App.noteIntance.modifyNote(cindex, note,{from:App.account}).then(
    //       function(result) {
    //         return App.getNotes();
    //       }
    //     ).catch(function (err) {
    //       console.log(err.message);
    //     });
    // });
  },

  watchChange: function(name) {
      var infoEvent;
      if(name=="cert")infoEvent = App.certIntance.NewCert();
      else if(name=="ca")infoEvent = App.certIntance.NewCA();
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
