import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { NameService } from '../services/NameService.js';
import { logger } from '../utils/logger.js';
import { Animations } from '../utils/animations.js';

export class NameMenu {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
        this.nameService = new NameService(walletManager, stats);
    }

    async show() {
        console.clear();
        
        const header = boxen(
            chalk.blue.bold('📝 NAME REGISTRATION MENU') + '\n' +
            chalk.gray('Register domain names from multiple wallets'),
            {
                padding: 1,
                borderColor: 'blue',
                borderStyle: 'round'
            }
        );
        console.log(header);

        const { registrationType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'registrationType',
                message: 'Choose registration type:',
                choices: [
                    { name: '🔄 Same name for all wallets', value: 'same' },
                    { name: '🎲 Different names for each wallet', value: 'different' }
                ]
            }
        ]);

        let domainName;

        if (registrationType === 'same') {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'domainName',
                    message: 'Enter domain name to register:',
                    validate: (input) => {
                        const validation = this.nameService.validateName(input);
                        return validation.valid || validation.error;
                    }
                }
            ]);
            domainName = answers.domainName;
        }

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Register names for ${this.walletManager.getWalletCount()} wallets?`,
                default: false
            }
        ]);

        if (!confirm) {
            logger.info('Name registration cancelled.');
            return;
        }

        const wallets = this.walletManager.getWallets();
        let successCount = 0;
        let failCount = 0;

        logger.info(`Starting name registration for ${wallets.length} wallets...\n`);

        for (let i = 0; i < wallets.length; i++) {
            const walletData = wallets[i];
            
            let currentDomainName = domainName;
            
            if (registrationType === 'different') {
                currentDomainName = this.nameService.generateRandomName(i);
            }

            const spinner = Animations.createSpinner(`Registering "${currentDomainName}" for ${walletData.name}...`);
            spinner.start();

            try {
                const result = await this.nameService.registerName(walletData, currentDomainName);
                spinner.stop();
                
                if (result.success) {
                    logger.success(`Registered successfully! TX: ${result.hash}`);
                    successCount++;
                } else {
                    logger.error(`Registration failed: ${result.error}`);
                    failCount++;
                }
            } catch (error) {
                spinner.stop();
                logger.error(`Registration failed: ${error.message}`);
                failCount++;
            }

            // Small delay between wallets
            if (i < wallets.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        Animations.successBox(`Name Registration Complete! Success: ${successCount}, Failed: ${failCount}`);
    }
}
