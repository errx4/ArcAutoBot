import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { NFTMenu } from './NFTMenu.js';
import { TokenMenu } from './TokenMenu.js';
import { NameMenu } from './NameMenu.js';
import { FaucetMenu } from './FaucetMenu.js';
import { AutoAllMenu } from './AutoAllMenu.js';
import { BalanceMenu } from './BalanceMenu.js';
import { StatsMenu } from './StatsMenu.js';
import { logger } from '../utils/logger.js';

export class MainMenu {
    constructor(walletManager) {
        this.walletManager = walletManager;
        this.stats = {
            totalTransactions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            faucetClaims: 0,
            nftsMinted: 0,
            tokensDeployed: 0,
            namesRegistered: 0,
            startTime: Date.now()
        };
    }

    async show() {
        while (true) {
            console.clear();
            this.displayHeader();
            
            const { choice } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'choice',
                    message: chalk.cyan('Choose an option:'),
                    choices: [
                        { name: '🎨  Mint NFT', value: 'nft' },
                        { name: '🪙  Deploy Token', value: 'token' },
                        { name: '📝  Register Name', value: 'name' },
                        { name: '💧  Manual Faucet Guide', value: 'faucet' },
                        { name: '🚀  AUTO ALL (Full Automation)', value: 'auto' },
                        { name: '💰  Check All Balances', value: 'balance' },
                        { name: '📊  View Statistics', value: 'stats' },
                        { name: '❌  Exit', value: 'exit' }
                    ]
                }
            ]);

            switch (choice) {
                case 'nft':
                    const nftMenu = new NFTMenu(this.walletManager, this.stats);
                    await nftMenu.show();
                    break;
                case 'token':
                    const tokenMenu = new TokenMenu(this.walletManager, this.stats);
                    await tokenMenu.show();
                    break;
                case 'name':
                    const nameMenu = new NameMenu(this.walletManager, this.stats);
                    await nameMenu.show();
                    break;
                case 'faucet':
                    const faucetMenu = new FaucetMenu(this.walletManager, this.stats);
                    await faucetMenu.show();
                    break;
                case 'auto':
                    const autoMenu = new AutoAllMenu(this.walletManager, this.stats);
                    await autoMenu.show();
                    break;
                case 'balance':
                    const balanceMenu = new BalanceMenu(this.walletManager, this.stats);
                    await balanceMenu.show();
                    break;
                case 'stats':
                    const statsMenu = new StatsMenu(this.walletManager, this.stats);
                    await statsMenu.show();
                    break;
                case 'exit':
                    logger.boxed.success('Thank you for using ARC Testnet Bot!');
                    process.exit(0);
            }

            await this.pressToContinue();
        }
    }

    displayHeader() {
        const header = boxen(
            chalk.cyan.bold('🎯 ARC TESTNET AUTOMATION BOT') + '\n\n' +
            chalk.white(`Wallets: ${this.walletManager.getWalletCount()} | `) +
            chalk.green(`Success: ${this.stats.successfulTransactions} | `) +
            chalk.red(`Failed: ${this.stats.failedTransactions}`),
            {
                padding: 1,
                borderColor: 'cyan',
                borderStyle: 'round',
                margin: { bottom: 2 }
            }
        );
        console.log(header);
    }

    async pressToContinue() {
        await inquirer.prompt([
            {
                type: 'input',
                name: 'continue',
                message: chalk.gray('Press Enter to continue...')
            }
        ]);
    }
}
