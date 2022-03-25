pragma solidity ^0.5.0;
/* pragma experimental ABIEncoderV2; */

contract CertContract {

    struct cert{
      string certid;
      string time;
      string ca;
      string ipfsaddress;
    }

    struct user{
      string name;
      bool noempty;
    }

    mapping(uint => cert[])public certmap;
    mapping(uint => user)public usermap;
    mapping(address => user)public camap;

    constructor() public {
    }

    event NewCert(address sender,string id);

// 添加记事

    function addCert(uint userid, string memory name,string memory certid,string memory time,string memory ipfsaddress) public {
        require(camap[msg.sender].noempty==true);
        if(usermap[userid].noempty== false){
          usermap[userid].name = name;
          usermap[userid].noempty=true;
        }
        cert memory c = cert(certid,time,camap[msg.sender].name,ipfsaddress);
        certmap[userid].push(c);
        emit NewCert(msg.sender,certid);
    }

    function getCertsLen(uint own) public view returns (uint) {
        return certmap[own].length;
    }

    event NewCA(address sender,string newca);

    function addCA(string memory newca) public {
        require(camap[msg.sender].noempty==false);
        camap[msg.sender].noempty=true;
        camap[msg.sender].name = newca;
        emit NewCA(msg.sender, newca);
    }

}
