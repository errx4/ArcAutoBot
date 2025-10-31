import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { TokenService } from '../services/TokenService.js';
import { logger } from '../utils/logger.js';
import { Animations } from '../utils/animations.js';

export class TokenMenu {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
        this.tokenService = new TokenService(walletManager, stats);
    }

    async show() {
        console.clear();
        
        const header = boxen(
            chalk.yellow.bold('🪙 TOKEN DEPLOYMENT MENU') + '\n' +
            chalk.gray('Deploy custom tokens from multiple wallets'),
            {
                padding: 1,
                borderColor: 'yellow',
                borderStyle: 'round'
            }
        );
        console.log(header);

        const { deploymentType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'deploymentType',
                message: 'Choose deployment type:',
                choices: [
                    { name: '🔄 Same token for all wallets', value: 'same' },
                    { name: '🎲 Different tokens for each wallet', value: 'different' }
                ]
            }
        ]);

        let tokenName, tokenSymbol, tokenSupply;

        if (deploymentType === 'same') {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'tokenName',
                    message: 'Enter token name:',
                    validate: (input) => {
                        const validation = this.tokenService.validateTokenName(input);
                        return validation.valid || validation.error;
                    }
                },
                {
                    type: 'input',
                    name: 'tokenSymbol',
                    message: 'Enter token symbol:',
                    validate: (input) => {
                        const validation = this.tokenService.validateTokenSymbol(input);
                        return validation.valid || validation.error;
                    }
                },
                {
                    type: 'number',
                    name: 'tokenSupply',
                    message: 'Enter token supply:',
                    default: 1000000
                }
            ]);
            tokenName = answers.tokenName;
            tokenSymbol = answers.tokenSymbol;
            tokenSupply = answers.tokenSupply;
        }

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Deploy tokens for ${this.walletManager.getWalletCount()} wallets?`,
                default: false
            }
        ]);

        if (!confirm) {
            logger.info('Token deployment cancelled.');
            return;
        }

        const wallets = this.walletManager.getWallets();
        let successCount = 0;
        let failCount = 0;

        logger.info(`Starting token deployment for ${wallets.length} wallets...\n`);

        for (let i = 0; i < wallets.length; i++) {
            const walletData = wallets[i];
            
            let currentTokenName = tokenName;
            let currentTokenSymbol = tokenSymbol;
            
            if (deploymentType === 'different') {
                const randomConfig = this.tokenService.generateRandomTokenConfig(i);
                currentTokenName = randomConfig.name;
                currentTokenSymbol = randomConfig.symbol;
                tokenSupply = randomConfig.supply;
            }

            const spinner = Animations.createSpinner(`Deploying ${currentTokenName} for ${walletData.name}...`);
            spinner.start();

            try {
                const result = await this.tokenService.deployToken(
                    walletData, 
                    currentTokenName, 
                    currentTokenSymbol, 
                    tokenSupply
                );
                spinner.stop();
                
                if (result.success) {
                    logger.success(`Deployed successfully! TX: ${result.hash}`);
                    successCount++;
                } else {
                    logger.error(`Deployment failed: ${result.error}`);
                    failCount++;
                }
            } catch (error) {
                spinner.stop();
                logger.error(`Deployment failed: ${error.message}`);
                failCount++;
            }

            // Small delay between wallets
            if (i < wallets.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        Animations.successBox(`Token Deployment Complete! Success: ${successCount}, Failed: ${failCount}`);
    }
}
