import chalk from 'chalk';
import boxen from 'boxen';

export const logger = {
    // Basic logging methods
    info: (msg) => console.log(chalk.blue('┃ ℹ ') + chalk.white(msg)),
    success: (msg) => console.log(chalk.green('┃ ✓ ') + chalk.white(msg)),
    error: (msg) => console.log(chalk.red('┃ ✗ ') + chalk.white(msg)),
    warn: (msg) => console.log(chalk.yellow('┃ ⚠ ') + chalk.white(msg)),
    loading: (msg) => console.log(chalk.cyan('┃ ⟳ ') + chalk.white(msg)),
    transaction: (msg) => console.log(chalk.magenta('┃ 🔄 ') + chalk.white(msg)),
    proxy: (msg) => console.log(chalk.blue('┃ 🔒 ') + chalk.white(msg)),
    
    // Boxed messages for important notifications
    boxed: {
        success: (msg) => {
            const box = boxen(chalk.green('✅ ' + msg), {
                padding: 1,
                borderColor: 'green',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 }
            });
            console.log(box);
        },
        error: (msg) => {
            const box = boxen(chalk.red('❌ ' + msg), {
                padding: 1,
                borderColor: 'red',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 }
            });
            console.log(box);
        },
        info: (msg) => {
            const box = boxen(chalk.blue('ℹ️ ' + msg), {
                padding: 1,
                borderColor: 'blue',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 }
            });
            console.log(box);
        },
        warning: (msg) => {
            const box = boxen(chalk.yellow('⚠️ ' + msg), {
                padding: 1,
                borderColor: 'yellow',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 }
            });
            console.log(box);
        }
    },

    // Wallet-specific logging
    wallet: {
        info: (walletName, msg) => console.log(chalk.blue(`┃ [${walletName}] ℹ `) + chalk.white(msg)),
        success: (walletName, msg) => console.log(chalk.green(`┃ [${walletName}] ✓ `) + chalk.white(msg)),
        error: (walletName, msg) => console.log(chalk.red(`┃ [${walletName}] ✗ `) + chalk.white(msg)),
        transaction: (walletName, msg) => console.log(chalk.magenta(`┃ [${walletName}] 🔄 `) + chalk.white(msg))
    },

    // Transaction logging
    transaction: {
        sent: (hash, walletName = '') => {
            const prefix = walletName ? `[${walletName}] ` : '';
            console.log(chalk.cyan(`┃ ${prefix}📤 Transaction sent: ${chalk.yellow(hash)}`));
        },
        confirmed: (hash, walletName = '') => {
            const prefix = walletName ? `[${walletName}] ` : '';
            console.log(chalk.green(`┃ ${prefix}✅ Transaction confirmed: ${chalk.yellow(hash)}`));
        },
        failed: (hash, error, walletName = '') => {
            const prefix = walletName ? `[${walletName}] ` : '';
            console.log(chalk.red(`┃ ${prefix}❌ Transaction failed: ${chalk.yellow(hash)}`));
            console.log(chalk.red(`┃   Error: ${error}`));
        }
    },

    // Progress logging
    progress: (current, total, message = 'Processing') => {
        const percentage = ((current / total) * 100).toFixed(1);
        const barLength = 20;
        const filledLength = Math.round((barLength * current) / total);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        
        console.log(chalk.blue(`┃ ${message}: [${bar}] ${percentage}% (${current}/${total})`));
    },

    // Section headers
    section: (title) => {
        console.log('\n' + chalk.cyan('┌' + '─'.repeat(60) + '┐'));
        console.log(chalk.cyan('│') + chalk.bold(` ${title} `.padEnd(60, ' ')) + chalk.cyan('│'));
        console.log(chalk.cyan('└' + '─'.repeat(60) + '┘'));
    },

    // Divider
    divider: () => {
        console.log(chalk.gray('─'.repeat(70)));
    }
};
