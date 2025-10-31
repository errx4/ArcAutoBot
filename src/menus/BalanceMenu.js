import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { logger } from '../utils/logger.js';

export class BalanceMenu {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
    }

    async show() {
        console.clear();
        
        const header = boxen(
            chalk.green.bold('💰 WALLET BALANCES') + '\n' +
            chalk.gray('Check balances for all wallets'),
            {
                padding: 1,
                borderColor: 'green',
                borderStyle: 'round'
            }
        );
        console.log(header);

        logger.info('Checking balances for all wallets...\n');

        const balances = await this.walletManager.checkAllBalances();
        
        let totalBalance = 0;
        let sufficientWallets = 0;

        console.log(chalk.cyan('┌' + '─'.repeat(70) + '┐'));
        console.log(chalk.cyan('│') + chalk.white.bold(' Wallet Balances '.padEnd(70, ' ')) + chalk.cyan('│'));
        console.log(chalk.cyan('├' + '─'.repeat(70) + '┤'));

        for (const balanceInfo of balances) {
            totalBalance += balanceInfo.balance;
            
            const status = balanceInfo.sufficient ? 
                chalk.green('✓ SUFFICIENT') : 
                chalk.red('✗ INSUFFICIENT');
            
            const walletDisplay = chalk.white(balanceInfo.name.padEnd(15, ' '));
            const balanceDisplay = chalk.yellow(balanceInfo.balanceFormatted.padEnd(10, ' ') + ' ETH');
            const addressDisplay = chalk.gray(balanceInfo.wallet.address.slice(0, 8) + '...' + balanceInfo.wallet.address.slice(-6));
            
            console.log(chalk.cyan('│ ') + walletDisplay + balanceDisplay + status.padEnd(15, ' ') + chalk.cyan(' │'));
            console.log(chalk.cyan('│ ') + addressDisplay.padEnd(68, ' ') + chalk.cyan(' │'));
            console.log(chalk.cyan('├' + '─'.repeat(70) + '┤'));

            if (balanceInfo.sufficient) sufficientWallets++;
        }

        // Summary
        console.log(chalk.cyan('│ ') + chalk.white.bold('Summary:'.padEnd(68, ' ')) + chalk.cyan(' │'));
        console.log(chalk.cyan('│ ') + chalk.white(`Total Wallets: ${balances.length}`.padEnd(68, ' ')) + chalk.cyan(' │'));
        console.log(chalk.cyan('│ ') + chalk.green(`Funded Wallets: ${sufficientWallets}`.padEnd(68, ' ')) + chalk.cyan(' │'));
        console.log(chalk.cyan('│ ') + chalk.red(`Needs Funds: ${balances.length - sufficientWallets}`.padEnd(68, ' ')) + chalk.cyan(' │'));
        console.log(chalk.cyan('│ ') + chalk.yellow(`Total Balance: ${totalBalance.toFixed(6)} ETH`.padEnd(68, ' ')) + chalk.cyan(' │'));
        console.log(chalk.cyan('└' + '─'.repeat(70) + '┘'));

        if (balances.length - sufficientWallets > 0) {
            console.log('\n');
            logger.warn(`${balances.length - sufficientWallets} wallet(s) need testnet tokens!`);
            logger.info('💡 Use "Manual Faucet Guide" to get free testnet tokens');
        }
    }
}
