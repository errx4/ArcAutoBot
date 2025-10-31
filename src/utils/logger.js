import chalk from 'chalk';
import boxen from 'boxen';

export const logger = {
    info: (msg) => console.log(chalk.blue('┃ ℹ ') + chalk.white(msg)),
    success: (msg) => console.log(chalk.green('┃ ✓ ') + chalk.white(msg)),
    error: (msg) => console.log(chalk.red('┃ ✗ ') + chalk.white(msg)),
    warn: (msg) => console.log(chalk.yellow('┃ ⚠ ') + chalk.white(msg)),
    loading: (msg) => console.log(chalk.cyan('┃ ⟳ ') + chalk.white(msg)),
    transaction: (msg) => console.log(chalk.magenta('┃ 🔄 ') + chalk.white(msg)),
    
    boxed: {
        success: (msg) => console.log(boxen(chalk.green('✓ ' + msg), { padding: 1, borderColor: 'green' })),
        error: (msg) => console.log(boxen(chalk.red('✗ ' + msg), { padding: 1, borderColor: 'red' })),
        info: (msg) => console.log(boxen(chalk.blue('ℹ ' + msg), { padding: 1, borderColor: 'blue' }))
    }
};
