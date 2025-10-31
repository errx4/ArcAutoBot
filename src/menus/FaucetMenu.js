import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { FaucetService } from '../services/FaucetService.js';
import { logger } from '../utils/logger.js';
import { Animations } from '../utils/animations.js';

export class FaucetMenu {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
        this.faucetService = new FaucetService(walletManager, stats);
    }

    async show() {
        console.clear();
        
        const header = boxen(
            chalk.cyan.bold('💧 MANUAL FAUCET GUIDE') + '\n' +
            chalk.gray('Step-by-step guide to get testnet tokens'),
            {
                padding: 1,
                borderColor: 'cyan',
                borderStyle: 'round'
            }
        );
        console.log(header);

        logger.info('This guide will help you manually request tokens for each wallet.\n');

        const wallets = this.walletManager.getWallets();
        
        // First, check which wallets need faucet
        const eligibilityResults = [];
        
        for (const walletData of wallets) {
            const eligibility = await this.faucetService.checkFaucetEligibility(walletData);
            eligibilityResults.push(eligibility);
        }

        const needsFaucet = eligibilityResults.filter(r => r.needsFaucet).length;
        const alreadyFunded = eligibilityResults.filter(r => !r.needsFaucet).length;

        console.log(chalk.yellow(`📊 Eligibility Summary:`));
        console.log(chalk.green(`✅ Already funded: ${alreadyFunded} wallets`));
        console.log(chalk.red(`❌ Need faucet: ${needsFaucet} wallets\n`));

        if (needsFaucet === 0) {
            Animations.successBox('All wallets already have sufficient balance!');
            return;
        }

        const { proceed } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: `Proceed with faucet guide for ${needsFaucet} wallets?`,
                default: true
            }
        ]);

        if (!proceed) {
            logger.info('Faucet guide cancelled.');
            return;
        }

        const walletsNeedingFaucet = wallets.filter((wallet, index) => 
            eligibilityResults[index].needsFaucet
        );

        const results = await this.faucetService.processManualFaucet(walletsNeedingFaucet);

        Animations.successBox(
            `Faucet Guide Complete!\n` +
            `Guided: ${results.guided} wallets | Already funded: ${results.alreadyFunded} wallets`
        );

        // Option to verify faucet claims
        const { verify } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'verify',
                message: 'Would you like to verify faucet claims now?',
                default: false
            }
        ]);

        if (verify) {
            await this.verifyFaucetClaims(walletsNeedingFaucet);
        }
    }

    async verifyFaucetClaims(wallets) {
        logger.info('\n🔍 Verifying faucet claims...\n');

        let verified = 0;
        let pending = 0;

        for (const walletData of wallets) {
            const result = await this.faucetService.verifyFaucetClaim(walletData);
            
            if (result.success) {
                verified++;
            } else {
                pending++;
            }

            // Small delay between verifications
            if (wallets.indexOf(walletData) < wallets.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log('\n' + '─'.repeat(50));
        console.log(chalk.green(`✅ Verified: ${verified} wallets`));
        console.log(chalk.yellow(`⏳ Pending: ${pending} wallets`));
        console.log('─'.repeat(50));
    }
}
