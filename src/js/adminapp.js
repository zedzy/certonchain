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
        return App.bindEvents();
      });

    });

  },

  bindEvents: function() {

    $("#new_uploader").on('click', function(){
      console.log("click new");
      var flag=true;
      $('textarea').each(function(){
        var check = this.value;
        if(check.match(/^[ ]*$/)){
          alert("your input exit empty");
          flag=false;
          return false;
        }
      });
      if(flag){
        console.log(App.account);
        App.certIntance.addUploader($("#new_uploader1").val(),$("#new_uploader2").val(),{from:App.account}).then(function(result) {
           return App.watchChange();
        }).catch(function (err) {
          alert(err.message);
          console.log(err.message);
        });
      }
    });

    $("#all_uploader").on('click', function(){
      console.log("click all");
      $('#uploaders').remove();
      $('.row').append('<div id="uploaders" ></div>');
        App.certIntance.getUploadListLen().then(function(len) {
          console.log("num of uploader:" + len);
          App.arrayLength = len;
          if (len > 0) {
            App.loadUploader( len - 1);
          }else{
            alert("number of uploaders:0");
          }
        }).catch(function(err) {
          alert(err.message);
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

  loadUploader: function(index) {
    App.certIntance.uploadlist(index).then(function(address) {
      App.certIntance.uploadermap(address).then(function(name){
        $("#uploaders").append(
        '<div class="form-horizontal"> <div class="form-group"><div class="col-sm-8 col-sm-push-1 ">' +
        ' <textarea class="form-control" id="uploader'+
        + index
        + '" >'
        + address + '\n'+ name
        + '</textarea></div>'
        +  '</div> </div>');
        if (index -1 >= 0) {
          App.loadUploader(index - 1);
        } else {
          App.adjustHeight();
        }
      });
    }).catch(function(err) {
      alert(err.message);
      console.log(err.message);
    });
  },

  watchChange: function() {
      var infoEvent = App.certIntance.NewUploader();
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
