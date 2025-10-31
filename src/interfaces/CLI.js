import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { logger } from '../utils/logger.js';
import { Animations } from '../utils/animations.js';

export class CLI {
    constructor() {
        this.currentMenu = null;
        this.userPreferences = {
            animationSpeed: 'normal',
            showTips: true,
            autoConfirm: false,
            theme: 'default'
        };
    }

    // Main menu display with enhanced UI
    async showMainMenu(menuItems, title = 'ARC TESTNET BOT') {
        const menuBox = boxen(
            chalk.cyan.bold(`🎯 ${title}`) + '\n' +
            chalk.gray('Choose an option from the menu below'),
            {
                padding: 1,
                borderColor: 'cyan',
                borderStyle: 'round',
                margin: { bottom: 2 }
            }
        );

        console.log(menuBox);

        const { choice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: chalk.cyan('Select an option:'),
                choices: menuItems.map(item => ({
                    name: item.icon ? `${item.icon}  ${item.name}` : `   ${item.name}`,
                    value: item.value,
                    description: item.description ? chalk.gray(item.description) : ''
                })),
                pageSize: 12
            }
        ]);

        return choice;
    }

    // Enhanced input with validation
    async promptInput(message, defaultValue = '', validation = null) {
        const questions = [
            {
                type: 'input',
                name: 'value',
                message: chalk.blue(message),
                default: defaultValue,
                validate: validation || (() => true)
            }
        ];

        const answers = await inquirer.prompt(questions);
        return answers.value;
    }

    // Number input with range validation
    async promptNumber(message, defaultValue = 1, min = 1, max = 1000) {
        const questions = [
            {
                type: 'number',
                name: 'value',
                message: chalk.blue(message),
                default: defaultValue,
                validate: (value) => {
                    if (isNaN(value)) return 'Please enter a valid number';
                    if (value < min) return `Value must be at least ${min}`;
                    if (value > max) return `Value must be less than ${max}`;
                    return true;
                }
            }
        ];

        const answers = await inquirer.prompt(questions);
        return answers.value;
    }

    // Confirmation with custom message
    async confirmAction(message, defaultValue = false) {
        const questions = [
            {
                type: 'confirm',
                name: 'value',
                message: chalk.yellow('❓ ' + message),
                default: defaultValue
            }
        ];

        const answers = await inquirer.prompt(questions);
        return answers.value;
    }

    // Password input with masking
    async promptPassword(message, confirmation = false) {
        const questions = [
            {
                type: 'password',
                name: 'password',
                message: chalk.blue(message),
                mask: '*',
                validate: (value) => {
                    if (!value) return 'Password cannot be empty';
                    if (value.length < 8) return 'Password must be at least 8 characters';
                    return true;
                }
            }
        ];

        if (confirmation) {
            questions.push({
                type: 'password',
                name: 'confirmPassword',
                message: chalk.blue('Confirm password:'),
                mask: '*',
                validate: (value, answers) => {
                    if (value !== answers.password) {
                        return 'Passwords do not match';
                    }
                    return true;
                }
            });
        }

        const answers = await inquirer.prompt(questions);
        return answers.password;
    }

    // List selection with search
    async promptList(message, choices, pageSize = 10) {
        const questions = [
            {
                type: 'list',
                name: 'value',
                message: chalk.blue(message),
                choices: choices,
                pageSize: pageSize
            }
        ];

        const answers = await inquirer.prompt(questions);
        return answers.value;
    }

    // Checkbox for multiple selections
    async promptCheckbox(message, choices, defaultSelected = []) {
        const questions = [
            {
                type: 'checkbox',
                name: 'values',
                message: chalk.blue(message),
                choices: choices,
                default: defaultSelected,
                validate: (answer) => {
                    if (answer.length === 0) {
                        return 'You must choose at least one option';
                    }
                    return true;
                }
            }
        ];

        const answers = await inquirer.prompt(questions);
        return answers.values;
    }

    // Progress bar display
    showProgressBar(current, total, label = 'Progress', width = 40) {
        const percentage = Math.min(100, Math.max(0, (current / total) * 100));
        const filledLength = Math.round((width * current) / total);
        const bar = '█'.repeat(filledLength) + '░'.repeat(width - filledLength);
        
        const progressText = `${chalk.blue(label)}: [${chalk.green(bar)}] ${chalk.yellow(percentage.toFixed(1))}% (${current}/${total})`;
        process.stdout.write('\r' + progressText);
        
        if (current === total) {
            process.stdout.write('\n');
        }
    }

    // Interactive table display
    displayTable(headers, rows, title = '') {
        if (title) {
            console.log('\n' + chalk.cyan.bold(title));
            console.log(chalk.gray('─'.repeat(60)));
        }

        // Calculate column widths
        const colWidths = headers.map((header, index) => {
            const headerLength = header.length;
            const maxDataLength = Math.max(...rows.map(row => String(row[index] || '').length));
            return Math.max(headerLength, maxDataLength) + 2;
        });

        // Print header
        let headerRow = chalk.cyan('│');
        headers.forEach((header, index) => {
            headerRow += chalk.cyan.bold(` ${header.padEnd(colWidths[index] - 1)}│`);
        });
        console.log(chalk.cyan('┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐'));
        console.log(headerRow);
        console.log(chalk.cyan('├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤'));

        // Print rows
        rows.forEach(row => {
            let rowText = chalk.cyan('│');
            row.forEach((cell, index) => {
                const cellStr = String(cell || '');
                rowText += ` ${cellStr.padEnd(colWidths[index] - 1)}${chalk.cyan('│')}`;
            });
            console.log(rowText);
        });

        console.log(chalk.cyan('└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘'));
    }

    // Status display for operations
    showOperationStatus(operation, status, details = '') {
        const statusIcons = {
            pending: '⏳',
            running: '🔄',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };

        const statusColors = {
            pending: 'yellow',
            running: 'blue',
            success: 'green',
            error: 'red',
            warning: 'yellow'
        };

        const icon = statusIcons[status] || 'ℹ️';
        const color = statusColors[status] || 'white';

        const statusText = chalk[color](`${icon} ${operation}: ${status}`);
        console.log(`  ${statusText} ${details ? chalk.gray(details) : ''}`);
    }

    // Wallet information display
    displayWalletInfo(walletData, showPrivateKey = false) {
        const infoBox = boxen(
            chalk.blue.bold('👛 WALLET INFORMATION') + '\n\n' +
            chalk.white(`Name: ${walletData.name}\n`) +
            chalk.white(`Address: ${walletData.wallet.address}\n`) +
            (showPrivateKey ? chalk.red(`Private Key: ${walletData.wallet.privateKey}\n`) : '') +
            chalk.gray(`Proxy: ${walletData.proxy || 'None'}`),
            {
                padding: 1,
                borderColor: 'blue',
                borderStyle: 'round',
                margin: { bottom: 1 }
            }
        );
        console.log(infoBox);
    }

    // Transaction result display
    displayTransactionResult(result, operation) {
        if (result.success) {
            const successBox = boxen(
                chalk.green.bold(`✅ ${operation.toUpperCase()} SUCCESS`) + '\n\n' +
                chalk.white(`Transaction Hash: ${result.hash}\n`) +
                (result.gasUsed ? chalk.white(`Gas Used: ${result.gasUsed}\n`) : '') +
                (result.address ? chalk.white(`Contract: ${result.address}\n`) : '') +
                chalk.green('Operation completed successfully!'),
                {
                    padding: 1,
                    borderColor: 'green',
                    borderStyle: 'round'
                }
            );
            console.log(successBox);
        } else {
            const errorBox = boxen(
                chalk.red.bold(`❌ ${operation.toUpperCase()} FAILED`) + '\n\n' +
                chalk.white(`Error: ${result.error}\n`) +
                chalk.red('Operation failed. Please check the error message above.'),
                {
                    padding: 1,
                    borderColor: 'red',
                    borderStyle: 'round'
                }
            );
            console.log(errorBox);
        }
    }

    // Batch operation summary
    displayBatchSummary(results, operation) {
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        const successRate = ((successCount / totalCount) * 100).toFixed(1);

        const summaryBox = boxen(
            chalk.cyan.bold(`📊 ${operation.toUpperCase()} SUMMARY`) + '\n\n' +
            chalk.white(`Total Operations: ${totalCount}\n`) +
            chalk.green(`Successful: ${successCount}\n`) +
            chalk.red(`Failed: ${totalCount - successCount}\n`) +
            chalk.yellow(`Success Rate: ${successRate}%`),
            {
                padding: 1,
                borderColor: 'cyan',
                borderStyle: 'round'
            }
        );
        console.log(summaryBox);
    }

    // Wait for user input to continue
    async waitForContinue(message = 'Press Enter to continue...') {
        await inquirer.prompt([
            {
                type: 'input',
                name: 'continue',
                message: chalk.gray(message)
            }
        ]);
    }

    // Clear screen and show header
    clearScreen(title = 'ARC TESTNET AUTOMATION BOT') {
        console.clear();
        if (title) {
            const header = boxen(
                chalk.cyan.bold(`🎯 ${title}`) + '\n' +
                chalk.gray('Advanced Multi-Wallet Automation Suite'),
                {
                    padding: 1,
                    borderColor: 'cyan',
                    borderStyle: 'round',
                    margin: { bottom: 2 }
                }
            );
            console.log(header);
        }
    }

    // Display error with details
    showError(error, context = '') {
        const errorBox = boxen(
            chalk.red.bold('💥 ERROR OCCURRED') + '\n\n' +
            (context ? chalk.white(`Context: ${context}\n\n`) : '') +
            chalk.white(`Message: ${error.message}\n`) +
            (error.stack ? chalk.gray(`Stack: ${error.stack.split('\n')[1]}\n`) : '') +
            chalk.red('Please check the error details and try again.'),
            {
                padding: 1,
                borderColor: 'red',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 }
            }
        );
        console.log(errorBox);
    }

    // Display warning message
    showWarning(message, title = 'Warning') {
        const warningBox = boxen(
            chalk.yellow.bold(`⚠️  ${title.toUpperCase()}`) + '\n\n' +
            chalk.white(message),
            {
                padding: 1,
                borderColor: 'yellow',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 }
            }
        );
        console.log(warningBox);
    }

    // Display info message
    showInfo(message, title = 'Information') {
        const infoBox = boxen(
            chalk.blue.bold(`ℹ️  ${title.toUpperCase()}`) + '\n\n' +
            chalk.white(message),
            {
                padding: 1,
                borderColor: 'blue',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 }
            }
        );
        console.log(infoBox);
    }

    // Display success message
    showSuccess(message, title = 'Success') {
        const successBox = boxen(
            chalk.green.bold(`✅ ${title.toUpperCase()}`) + '\n\n' +
            chalk.white(message),
            {
                padding: 1,
                borderColor: 'green',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 }
            }
        );
        console.log(successBox);
    }

    // Interactive configuration setup
    async setupConfiguration() {
        this.clearScreen('BOT CONFIGURATION SETUP');
        
        logger.info('Let\'s configure your bot settings:\n');

        const config = await inquirer.prompt([
            {
                type: 'list',
                name: 'animationSpeed',
                message: 'Select animation speed:',
                choices: [
                    { name: '🚀 Fast', value: 'fast' },
                    { name: '🐢 Normal', value: 'normal' },
                    { name: '🐌 Slow', value: 'slow' },
                    { name: '❌ Disabled', value: 'disabled' }
                ],
                default: 'normal'
            },
            {
                type: 'confirm',
                name: 'showTips',
                message: 'Show helpful tips and recommendations?',
                default: true
            },
            {
                type: 'confirm',
                name: 'autoConfirm',
                message: 'Enable auto-confirm for batch operations?',
                default: false
            },
            {
                type: 'list',
                name: 'theme',
                message: 'Select color theme:',
                choices: [
                    { name: '🔵 Default Blue', value: 'default' },
                    { name: '🟢 Green', value: 'green' },
                    { name: '🟣 Purple', value: 'purple' },
                    { name: '🟠 Orange', value: 'orange' }
                ],
                default: 'default'
            }
        ]);

        this.userPreferences = { ...this.userPreferences, ...config };
        this.showSuccess('Configuration saved successfully!', 'Configuration');
        
        return this.userPreferences;
    }

    // Get user preferences
    getPreferences() {
        return this.userPreferences;
    }

    // Update single preference
    updatePreference(key, value) {
        this.userPreferences[key] = value;
    }

    // Display help information
    showHelp(topic = 'general') {
        const helpTopics = {
            general: `
${chalk.cyan.bold('ARC TESTNET BOT - HELP')}

${chalk.white('This bot helps you automate various operations on the ARC Testnet:')}

${chalk.green('🎨 NFT Minting')} - Mint test NFTs from predefined contracts
${chalk.yellow('🪙 Token Deployment')} - Deploy custom ERC-20 tokens
${chalk.blue('📝 Name Registration')} - Register domain names on the name service
${chalk.cyan('💧 Faucet Guide')} - Step-by-step guide to get testnet tokens
${chalk.magenta('🚀 Auto All')} - Complete automation of all operations
${chalk.green('💰 Balance Check')} - Check balances for all wallets
${chalk.blue('📊 Statistics')} - View session performance metrics

${chalk.yellow('📝 File Requirements:')}
- ${chalk.white('wallets.txt')}: Private keys (one per line, format: privateKey:walletName)
- ${chalk.white('proxies.txt')}: Proxy list (optional, one per line)

${chalk.red('⚠️  IMPORTANT:')}
- Use only testnet wallets with no real funds
- Keep your private keys secure
- The bot is for educational purposes only
            `,
            wallets: `
${chalk.cyan.bold('WALLET CONFIGURATION HELP')}

${chalk.white('Format your wallets.txt file correctly:')}

${chalk.green('Basic format:')}
${chalk.white('privateKey:walletName')}

${chalk.yellow('With proxy:')}
${chalk.white('privateKey:walletName:proxyIP:proxyPort')}

${chalk.blue('With authenticated proxy:')}
${chalk.white('privateKey:walletName:proxyIP:proxyPort:username:password')}

${chalk.white('Example:')}
${chalk.gray('0x123...abc:MyWallet1')}
${chalk.gray('0x456...def:MyWallet2:127.0.0.1:8080')}
${chalk.gray('0x789...ghi:MyWallet3:proxy.com:3128:user:pass')}

${chalk.red('Security Note:')}
- Never use mainnet private keys
- Consider using environment variables for sensitive data
- Keep your wallets.txt file secure
            `,
            faucet: `
${chalk.cyan.bold('FAUCET GUIDE HELP')}

${chalk.white('The manual faucet guide will help you:')}

1. ${chalk.green('Check wallet balances')} - Identify which wallets need funds
2. ${chalk.blue('Step-by-step instructions')} - Detailed guide for each wallet
3. ${chalk.yellow('Balance verification')} - Confirm when funds are received

${chalk.white('Faucet Website:')} ${chalk.cyan('https://faucet.circle.com/')}

${chalk.white('Process:')}
- Select "Arc Testnet" as the network
- Paste your wallet address
- Click "Send 10 USDC"
- Wait for confirmation

${chalk.red('Rate Limits:')}
- 1 request per hour per address
- If you see "Limit exceeded", wait 1 hour
            `
        };

        const helpContent = helpTopics[topic] || helpTopics.general;
        const helpBox = boxen(helpContent, {
            padding: 1,
            borderColor: 'cyan',
            borderStyle: 'round',
            margin: { top: 1, bottom: 1 }
        });

        console.log(helpBox);
    }
}

// Export singleton instance
export const cli = new CLI();
