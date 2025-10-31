import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { NFTService } from '../services/NFTService.js';
import { TokenService } from '../services/TokenService.js';
import { NameService } from '../services/NameService.js';
import { logger } from '../utils/logger.js';
import { Animations } from '../utils/animations.js';

export class AutoAllMenu {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
        this.nftService = new NFTService(walletManager, stats);
        this.tokenService = new TokenService(walletManager, stats);
        this.nameService = new NameService(walletManager, stats);
    }

    async show() {
        console.clear();
        
        const header = boxen(
            chalk.magenta.bold('🚀 AUTO ALL - FULL AUTOMATION') + '\n' +
            chalk.gray('Complete automation: Check + Mint + Deploy + Register'),
            {
                padding: 1,
                borderColor: 'magenta',
                borderStyle: 'round'
            }
        );
        console.log(header);

        logger.info('This will execute all operations for wallets with sufficient balance:\n');
        logger.info('1. Check Balances');
        logger.info('2. Mint NFT');
        logger.info('3. Deploy Token');
        logger.info('4. Register Name\n');

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Start AUTO ALL mode?',
                default: false
            }
        ]);

        if (!confirm) {
            logger.info('AUTO ALL mode cancelled.');
            return;
        }

        // STEP 1: Check balances
        logger.info(chalk.cyan.bold('\n[STEP 1/4] Checking Balances...'));
        console.log('─'.repeat(50));

        const walletsWithBalance = [];
        const walletsNeedingFunds = [];

        for (const walletData of this.walletManager.getWallets()) {
            const balanceCheck = await this.walletManager.checkBalance(walletData);
            const status = balanceCheck.sufficient ? chalk.green('✓') : chalk.red('✗');
            console.log(`${status} [${walletData.name}] Balance: ${balanceCheck.balanceFormatted} ETH`);
            
            if (balanceCheck.sufficient) {
                walletsWithBalance.push(walletData);
            } else {
                walletsNeedingFunds.push(walletData);
            }
        }

        if (walletsNeedingFunds.length > 0) {
            logger.warn(`\n⚠️  ${walletsNeedingFunds.length} wallet(s) need funds!`);
            logger.info('💡 Use Manual Faucet Guide to get testnet tokens');
            
            const { proceed } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'proceed',
                    message: `Continue with ${walletsWithBalance.length} funded wallet(s)?`,
                    default: true
                }
            ]);

            if (!proceed) {
                logger.info('AUTO ALL mode cancelled.');
                return;
            }
        }

        if (walletsWithBalance.length === 0) {
            Animations.errorBox('No wallets with sufficient balance!');
            return;
        }

        logger.success(`\n✅ Processing ${walletsWithBalance.length} wallet(s) with sufficient balance!\n`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Execute operations for each wallet
        for (let i = 0; i < walletsWithBalance.length; i++) {
            const walletData = walletsWithBalance[i];
            
            console.log(boxen(
                chalk.yellow.bold(`Processing Wallet ${i + 1}/${walletsWithBalance.length}`) + '\n' +
                chalk.white(`Name: ${walletData.name}`) + '\n' +
                chalk.white(`Address: ${walletData.wallet.address}`),
                { padding: 1, borderColor: 'yellow' }
            ));

            // STEP 2: Mint NFT
            logger.info(chalk.cyan('[STEP 2/4] Minting NFT...'));
            await this.nftService.mintNFT(walletData, 1);
            await new Promise(resolve => setTimeout(resolve, 5000));

            // STEP 3: Deploy Token
            logger.info(chalk.cyan('[STEP 3/4] Deploying Token...'));
            const tokenConfig = this.tokenService.generateRandomTokenConfig(i);
            await this.tokenService.deployToken(walletData, tokenConfig.name, tokenConfig.symbol, tokenConfig.supply);
            await new Promise(resolve => setTimeout(resolve, 5000));

            // STEP 4: Register Name
            logger.info(chalk.cyan('[STEP 4/4] Registering Name...'));
            const domainName = this.nameService.generateRandomName(i);
            await this.nameService.registerName(walletData, domainName);

            Animations.successBox(`Wallet ${walletData.name} completed all operations!`);

            if (i < walletsWithBalance.length - 1) {
                logger.info(chalk.yellow('Moving to next wallet in 5 seconds...\n'));
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        Animations.successBox(
            '🎉 AUTO ALL COMPLETED SUCCESSFULLY!\n\n' +
            `Processed: ${walletsWithBalance.length} wallets\n` +
            `NFTs Minted: ${this.stats.nftsMinted}\n` +
            `Tokens Deployed: ${this.stats.tokensDeployed}\n` +
            `Names Registered: ${this.stats.namesRegistered}`
        );
    }
              }
