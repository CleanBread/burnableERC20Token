pragma solidity >=0.8.0;

import "./IERC20.sol";
import "./ownable.sol";

contract BurnableERC20Token is Ownable, ERC20 {
  struct TokenSummary {
    string name;
    string symbol;
  }

  TokenSummary public tokenSummary;
  uint256 internal _totalSupply;

  mapping (address => uint256) internal balances;
  mapping (address => mapping (address => uint256)) internal allowed;

  constructor(string memory _name, string memory _symbol, uint256 initialBalance) {
    tokenSummary = TokenSummary(_name, _symbol);
    balances[msg.sender] = initialBalance;
    _totalSupply = initialBalance;
  }


  function transfer(address to, uint256 value) external returns (bool) {
    require(to != address(0) && balances[msg.sender] >= value);
    balances[msg.sender] -= value;
    balances[to] += value;
    emit Transfer(msg.sender, to, value);
    return true;
  }

  function approve(address spender, uint256 value) external returns (bool) {
    require(spender != address(0));
    allowed[msg.sender][spender] = value;
    emit Approval(msg.sender, spender, value);
    return true;
  }

  function transferFrom(address from, address to, uint256 value) external returns (bool) {
    require(from != address(0) && to != address(0) && balances[from] >= value && allowed[from][msg.sender] >= value);
    balances[from] = balances[from] - value;
    balances[to] = balances[to] + value;
    allowed[from][msg.sender] = allowed[from][msg.sender] - value;
    emit Transfer(msg.sender, to, value);
    return true;
  }

  function totalSupply() external view returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address who) external view returns (uint256) {
    return balances[who];
  }

  function allowance(address owner, address spender) external view returns (uint256) {
    return allowed[owner][spender];
  }

  function mint(address to, uint256 value) external onlyOwner{
    require(to != address(0));
    _totalSupply = _totalSupply + value;
    balances[to] = balances[to] + value;
    emit Transfer(address(0), to, value);
  }

  function burn(uint256 value) external returns (bool) {
    require(balances[msg.sender] >= value);
    _totalSupply = _totalSupply - value;
    balances[msg.sender] = balances[msg.sender] - value;
    emit Burn(msg.sender, value);
    return true;
  }

  function burnFrom(address who, uint256 value) external returns (bool) {
    address owner = owner();
    require(who != address(0) && balances[who] >= value && (allowed[who][msg.sender] >= value || msg.sender == owner));
    _totalSupply = _totalSupply - value;
    balances[who] = balances[who] - value;
    if (msg.sender != owner) {
    allowed[who][msg.sender] = allowed[who][msg.sender] - value;
    }
    emit Burn(who, value);
    return true;
  }
}