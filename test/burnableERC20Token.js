const BurnableERC20Token = artifacts.require('BurnableERC20Token');
const utils = require('./helpers/utils');

contract('BurnableERC20Token', (accounts) => {
  let [alice, bob] = accounts;

  let contractInstance;
  beforeEach(async () => {
    contractInstance = await BurnableERC20Token.new(
      'erc20',
      'ERC',
      '10000000000000000000',
      {
        from: alice,
      },
    );
  });
  context('test mint', () => {
    it('should be able to mint only owner', async () => {
      const value = '1000000000000000000';
      await contractInstance.mint(bob, value, { from: alice });
      const balance = await contractInstance.balanceOf(bob);

      assert.equal(+value, +balance);
    });
    it('should not be able to mint not owner', async () => {
      await utils.shouldThrow(
        contractInstance.mint(bob, '1000000000000000000', { from: bob }),
      );
    });
  });

  context('test burn', () => {
    it('should be able to burn', async () => {
      const value = '1000000000000000000';
      await contractInstance.mint(bob, value, { from: alice });
      const beforeBalance = await contractInstance.balanceOf(bob);
      await contractInstance.burn(value, { from: bob });
      const afterBalance = await contractInstance.balanceOf(bob);

      assert.equal(+beforeBalance, +afterBalance + +value);
    });

    it('should not be able to burn more than user have', async () => {
      const value = '1000000000000000000';
      await utils.shouldThrow(contractInstance.burn(value, { from: bob }));
    });
  });
  context('test burnFrom', () => {
    it('should be able to burnFrom for user with approve', async () => {
      const value = '1000000000000000000';
      await contractInstance.approve(bob, value, { from: alice });
      const beforeBalance = await contractInstance.balanceOf(alice);
      await contractInstance.burnFrom(alice, value, { from: bob });
      const afterBalance = await contractInstance.balanceOf(alice);

      assert.equal(+beforeBalance, +afterBalance + +value);
    });

    it('should not be able to burnFrom for user without approve', async () => {
      const value = '1000000000000000000';
      await utils.shouldThrow(
        contractInstance.burnFrom(alice, value, { from: bob }),
      );
    });

    it('should be able to burnFrom for admin without approve', async () => {
      const value = '1000000000000000000';
      await contractInstance.mint(bob, value, { from: alice });
      const beforeBalance = await contractInstance.balanceOf(bob);
      await contractInstance.burnFrom(bob, value, { from: alice });
      const afterBalance = await contractInstance.balanceOf(bob);

      assert.equal(+beforeBalance, +afterBalance + +value);
    });
  });

  context('test approve', () => {
    it('should be able to approve', async () => {
      const value = '1000000000000000000';
      await contractInstance.approve(bob, value, { from: alice });
      const allowance = await contractInstance.allowance(alice, bob);

      assert.equal(+value, +allowance);
    });
  });

  context('test transfer', () => {
    it('should be able to transfer', async () => {
      const value = '1000000000000000000';
      const bobBalanceBefore = await contractInstance.balanceOf(bob);
      const aliceBalanceBefore = await contractInstance.balanceOf(alice);
      await contractInstance.transfer(bob, value, { from: alice });
      const bobBalanceAfter = await contractInstance.balanceOf(bob);
      const aliceBalanceAfter = await contractInstance.balanceOf(alice);

      assert.equal(+bobBalanceBefore, +bobBalanceAfter - value);
      assert.equal(+aliceBalanceBefore, +aliceBalanceAfter + +value);
    });

    it('should not be able to transfer more than user have', async () => {
      const value = '1000000000000000000';
      await utils.shouldThrow(
        contractInstance.transfer(alice, value, { from: bob }),
      );
    });
  });

  context('test transferFrom', () => {
    it('should be able to transferFrom for user with approve', async () => {
      const value = '1000000000000000000';
      await contractInstance.approve(bob, value, { from: alice });
      const bobBalanceBefore = await contractInstance.balanceOf(bob);
      const aliceBalanceBefore = await contractInstance.balanceOf(alice);

      await contractInstance.transferFrom(alice, bob, value, { from: bob });

      const bobBalanceAfter = await contractInstance.balanceOf(bob);
      const aliceBalanceAfter = await contractInstance.balanceOf(alice);

      assert.equal(+bobBalanceBefore, +bobBalanceAfter - value);
      assert.equal(+aliceBalanceBefore, +aliceBalanceAfter + +value);
    });

    it('should not be able to burnFrom for user without approve', async () => {
      const value = '1000000000000000000';
      await utils.shouldThrow(
        contractInstance.transferFrom(alice, bob, value, { from: bob }),
      );
    });
  });
});
