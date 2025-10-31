import chalk from 'chalk';
import boxen from 'boxen';
import { logger } from '../utils/logger.js';

export class StatsMenu {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
    }

    async show() {
        console.clear();
        
        const header = boxen(
            chalk.blue.bold('📊 SESSION STATISTICS') + '\n' +
            chalk.gray('Complete session performance overview'),
            {
                padding: 1,
                borderColor: 'blue',
                borderStyle: 'round'
            }
        );
        console.log(header);

        this.displayStatistics();
        
        await this.pressToContinue();
    }

    displayStatistics() {
        const runtime = ((Date.now() - this.stats.startTime) / 1000 / 60).toFixed(2);
        const successRate = this.stats.totalTransactions > 0 ? 
            ((this.stats.successfulTransactions / this.stats.totalTransactions) * 100).toFixed(2) : 0;

        // Main statistics box
        const statsBox = boxen(
            chalk.cyan.bold('📈 PERFORMANCE OVERVIEW') + '\n\n' +
            chalk.white(`Runtime: ${runtime} minutes\n`) +
            chalk.white(`Total Transactions: ${this.stats.totalTransactions}\n`) +
            chalk.green(`Successful: ${this.stats.successfulTransactions}\n`) +
            chalk.red(`Failed: ${this.stats.failedTransactions}\n`) +
            chalk.yellow(`Success Rate: ${successRate}%`),
            {
                padding: 1,
                borderColor: 'cyan',
                margin: { bottom: 1 }
            }
        );
        console.log(statsBox);

        // Operations breakdown
        const operationsBox = boxen(
            chalk.magenta.bold('🛠️ OPERATIONS BREAKDOWN') + '\n\n' +
            chalk.white(`Faucet Claims: ${this.stats.faucetClaims}\n`) +
            chalk.white(`NFTs Minted: ${this.stats.nftsMinted}\n`) +
            chalk.white(`Tokens Deployed: ${this.stats.tokensDeployed}\n`) +
            chalk.white(`Names Registered: ${this.stats.namesRegistered}`),
            {
                padding: 1,
                borderColor: 'magenta',
                margin: { bottom: 1 }
            }
        );
        console.log(operationsBox);

        // Wallet information
        const walletBox = boxen(
            chalk.green.bold('👛 WALLET INFORMATION') + '\n\n' +
            chalk.white(`Total Wallets: ${this.walletManager.getWalletCount()}\n`) +
            chalk.white(`Proxies Available: ${this.walletManager.proxies.length}\n`) +
            chalk.gray('Use "Check All Balances" for detailed wallet info'),
            {
                padding: 1,
                borderColor: 'green'
            }
        );
        console.log(walletBox);

        // Recommendations
        if (this.stats.failedTransactions > this.stats.successfulTransactions) {
            console.log('\n');
            logger.warn('💡 Recommendation: Check your RPC connection and gas settings');
        }

        if (this.stats.faucetClaims === 0 && this.stats.totalTransactions === 0) {
            console.log('\n');
            logger.info('💡 Tip: Start with "Manual Faucet Guide" to get testnet tokens');
        }
    }

    async pressToContinue() {
        const { continue: cont } = await import('inquirer').then(module => 
            module.default.prompt([
                {
                    type: 'input',
                    name: 'continue',
                    message: chalk.gray('Press Enter to return to main menu...')
                }
            ])
        );
    }
}
