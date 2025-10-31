import { displayBanner } from './src/utils/animations.js';
import { MainMenu } from './src/menus/MainMenu.js';
import { WalletManager } from './src/core/WalletManager.js';
import { logger } from './src/utils/logger.js';

class ARCBot {
    constructor() {
        this.walletManager = new WalletManager();
        this.mainMenu = new MainMenu(this.walletManager);
    }

    async initialize() {
        try {
            // Display animated banner
            await displayBanner();
            
            // Load wallets and proxies
            await this.walletManager.loadWallets();
            await this.walletManager.loadProxies();
            
            // Start main menu
            await this.mainMenu.show();
            
        } catch (error) {
            logger.error(`Initialization failed: ${error.message}`);
            process.exit(1);
        }
    }
}

// Start the bot
const bot = new ARCBot();
bot.initialize().catch(console.error);
