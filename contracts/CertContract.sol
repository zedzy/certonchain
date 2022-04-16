pragma solidity ^0.5.0;
/* pragma experimental ABIEncoderV2; */

contract CertContract {

    struct cert{
      address uploader;
      bool iseffect;
      string ipfsaddress;
    }

    /* struct user{
      string name;
      bool noempty;
    } */

    mapping(address => cert[])public certmap;
    mapping(address => string)public uploadermap;

    address[] public uploadlist;
    address deployer = 0xB635d506cE5BAd75EE54e24ae932377a528C1225;

    constructor() public {
    }

    event NewCert(address uploader,string ipfsaddress);

    function addCert(address owner,string memory ipfsaddress) public {
        /* require(uploadermap[msg.sender]==true); */
        bool check =false;
        for (uint i =0; i<uploadlist.length;i++){
          if(uploadlist[i]==msg.sender){
            check=true;
            break;
          }
        }
        require(check==true);
        cert memory c = cert(owner,true,ipfsaddress);
        certmap[owner].push(c);
        emit NewCert(msg.sender,ipfsaddress);
    }

    function getCertsLen(address owner) public view returns (uint) {
        return certmap[owner].length;
    }

    event NewUploader(address uploader,string uploadname);

    function addUploader(address uploader,string memory name) public {
        require(msg.sender==deployer);
        /* require(uploadermap[uploader]==false); */
        bool check =false;
        for (uint i =0; i<uploadlist.length;i++){
          if(uploadlist[i]==uploader){
            check=true;
            break;
          }
        }
        require(check==false);
        uploadermap[uploader]=name;
        uploadlist.push(uploader);
        emit NewUploader(uploader, name);
    }

    function getUploadListLen()public view returns(uint) {
      return uploadlist.length;
    }

    event CancelCert(address canceler,address owner,uint index);

    function cancel(address owner,uint index)public{
      require(index>=0 && index<certmap[owner].length);
      require(msg.sender==certmap[owner][index].uploader);
      certmap[owner][index].iseffect = false;
      emit CancelCert(msg.sender,owner,index);
    }

}
