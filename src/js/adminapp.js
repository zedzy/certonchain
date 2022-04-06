App = {
  web3Provider: null,
  contracts: {},
  account: null,
  certIntance: null,
  arrayLength : 0,


  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {

    // if (window.ethereum) {
    //   App.web3Provider = window.ethereum;
    //   try {
    //     await window.ethereum.enable();
    //   } catch (error) {
    //     console.error("User denied account access");
    //   }
    // }
    // else if (window.web3) {
    //   App.web3Provider = window.web3.currentProvider;
    // }
    // else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      console.log("localhost7545");
    // }
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
        return App.getInfo();
      });

    });

  },

  getInfo: function() {
    $("#allca").on('click', function(){
      console.log("click allca");
      $('#users').remove();
      $('#cas').remove();
      $('.row').append('<div id="cas" ></div>');
        App.certIntance.getCAListLen().then(function(len) {
          console.log("num of ca:" + len);
          App.arrayLength = len;
          if (len > 0) {
            App.loadCA( len - 1);
          }
        }).catch(function(err) {
          console.log(err.message);
        });
    });

    $("#alluser").on('click', function(){
      console.log("click alluser");
      $('#cas').remove();
      $('#users').remove();
      $('.row').append('<div id="users" ></div>');
        App.certIntance.getUserListLen().then(function(len) {
          console.log("num of user:" + len);
          App.arrayLength = len;
          if (len > 0) {
            App.loadUser( len - 1);
          }
        }).catch(function(err) {
          console.log(err.message);
        });
    });

  },

  adjustHeight: function() {
    console.log("reset height");
    $('textarea').each(function () {
      console.log("reset height");
           this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        })
  },

  loadCA: function(index) {
    App.certIntance.calist(index).then(function(address) {
      App.certIntance.camap(address).then(function(caname){
        $("#cas").append(
        '<div class="form-horizontal"> <div class="form-group"><div class="col-sm-8 col-sm-push-1 ">' +
        ' <textarea class="form-control" id="ca'+
        + index
        + '" >'
        + address+' : '+caname[0]
        + '</textarea></div>'
        +  '</div> </div>');
        if (index -1 >= 0) {
          App.loadCA(index - 1);
        } else {
          App.adjustHeight();
        }
      });

    }).catch(function(err) {
      console.log(err.message);
    });
  },

  loadUser: function(index) {
    App.certIntance.userlist(index).then(function(userid) {
      App.certIntance.usermap(userid).then(function(username){
        $("#users").append(
        '<div class="form-horizontal"> <div class="form-group"><div class="col-sm-8 col-sm-push-1 ">' +
        ' <textarea class="form-control" id="user'+
        + index
        + '" >'
        + userid+' : '+username[0]
        + '</textarea></div>'
        +  '</div> </div>');
        if (index -1 >= 0) {
          App.loadUser(index - 1);
        } else {
          App.adjustHeight();
        }
      });
    }).catch(function(err) {
      console.log(err.message);
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
