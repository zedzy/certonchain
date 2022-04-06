pragma solidity ^0.5.0;
/* pragma experimental ABIEncoderV2; */

contract CertContract {

    struct cert{
      string ipfsaddress;
    }

    struct user{
      string name;
      bool noempty;
    }

    mapping(string => cert[])public certmap;
    mapping(string => user)public usermap;
    mapping(address => user)public camap;

    address[] public calist;
    string[] public userlist;

    constructor() public {
    }

    event NewCert(address sender,string ipfsaddress);

    function addCert(string memory userid, string memory name,string memory ipfsaddress) public {
        require(camap[msg.sender].noempty==true);
        if(usermap[userid].noempty== false){
          usermap[userid].name = name;
          usermap[userid].noempty=true;
          userlist.push(userid);
        }
        cert memory c = cert(ipfsaddress);
        certmap[userid].push(c);
        emit NewCert(msg.sender,ipfsaddress);
    }

    function getCertsLen(string memory own) public view returns (uint) {
        return certmap[own].length;
    }

    event NewCA(address sender,string newca);

    function addCA(string memory newca) public {
        require(camap[msg.sender].noempty==false);
        camap[msg.sender].noempty=true;
        camap[msg.sender].name = newca;
        calist.push(msg.sender);
        emit NewCA(msg.sender, newca);
    }

    function getCAListLen()public view returns(uint) {
      return calist.length;
    }

    function getUserListLen()public view returns(uint){
      return userlist.length;
    }

}
