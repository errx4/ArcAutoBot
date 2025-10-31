import inquirer from 'inquirer';
import chalk from 'chalk';
import { NFTService } from '../services/NFTService.js';
import { logger } from '../utils/logger.js';
import { Animations } from '../utils/animations.js';

export class NFTMenu {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
        this.nftService = new NFTService(walletManager, stats);
    }

    async show() {
        console.clear();
        
        const header = chalk.cyan.bold('🎨 NFT Minting Menu');
        console.log(header);
        console.log(chalk.gray('─'.repeat(50)) + '\n');

        const { amount } = await inquirer.prompt([
            {
                type: 'number',
                name: 'amount',
                message: 'How many NFTs to mint per wallet?',
                default: 1,
                validate: (value) => value > 0 ? true : 'Please enter a positive number'
            }
        ]);

        const wallets = this.walletManager.getWallets();
        let successCount = 0;
        let failCount = 0;

        for (const walletData of wallets) {
            const spinner = Animations.createSpinner(`Minting ${amount} NFT(s) for ${walletData.name}...`);
            spinner.start();

            try {
                const result = await this.nftService.mintNFT(walletData, amount);
                spinner.stop();
                
                if (result.success) {
                    logger.success(`Minted successfully! TX: ${result.hash}`);
                    successCount++;
                } else {
                    logger.error(`Mint failed: ${result.error}`);
                    failCount++;
                }
            } catch (error) {
                spinner.stop();
                logger.error(`Mint failed: ${error.message}`);
                failCount++;
            }

            // Small delay between wallets
            if (wallets.indexOf(walletData) < wallets.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        logger.boxed.success(`NFT Minting Complete! Success: ${successCount}, Failed: ${failCount}`);
    }
}
