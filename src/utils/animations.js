import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';

export class Animations {
    static async typewriter(text, speed = 50, color = 'cyan') {
        const coloredText = chalk[color] ? chalk[color](text) : text;
        process.stdout.write(chalk.cyan('┃ '));
        
        for (let char of coloredText) {
            process.stdout.write(char);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
        process.stdout.write('\n');
    }

    static async displayBanner() {
        console.clear();
        
        // Main banner with typewriter effect
        const bannerText = [
            'ARC TESTNET - AUTOMATION BOT',
            'By CryptoLab', 
            'https://t.me/cryptolab2x'
        ];

        const bannerBox = boxen(
            chalk.cyan.bold(bannerText[0]) + '\n\n' +
            chalk.yellow(bannerText[1]) + '\n' +
            chalk.blue(bannerText[2]),
            {
                padding: 2,
                margin: 2,
                borderStyle: 'double',
                borderColor: 'cyan',
                backgroundColor: '#000000',
                textAlignment: 'center'
            }
        );

        console.log(bannerBox);
        
        // Typewriter effect for initialization messages
        await this.typewriter('Initializing ARC Testnet Automation Bot...', 30, 'cyan');
        await this.typewriter('Loading wallet configurations...', 30, 'blue');
        await this.typewriter('Connecting to blockchain network...', 30, 'magenta');
        await this.typewriter('Setting up transaction manager...', 30, 'green');
        
        console.log('\n' + chalk.gray('═'.repeat(70)) + '\n');
    }

    static createSpinner(text, color = 'cyan') {
        const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        
        return ora({
            text: chalk[color](text),
            spinner: {
                interval: 80,
                frames: spinnerFrames
            },
            color: color
        });
    }

    static successBox(message, title = 'Success') {
        const box = boxen(
            chalk.green('✅ ') + chalk.bold(title) + '\n\n' + chalk.white(message),
            {
                padding: 1,
                borderColor: 'green',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 },
                textAlignment: 'center'
            }
        );
        console.log(box);
    }

    static errorBox(message, title = 'Error') {
        const box = boxen(
            chalk.red('❌ ') + chalk.bold(title) + '\n\n' + chalk.white(message),
            {
                padding: 1,
                borderColor: 'red',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 },
                textAlignment: 'center'
            }
        );
        console.log(box);
    }

    static warningBox(message, title = 'Warning') {
        const box = boxen(
            chalk.yellow('⚠️ ') + chalk.bold(title) + '\n\n' + chalk.white(message),
            {
                padding: 1,
                borderColor: 'yellow',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 },
                textAlignment: 'center'
            }
        );
        console.log(box);
    }

    static infoBox(message, title = 'Information') {
        const box = boxen(
            chalk.blue('ℹ️ ') + chalk.bold(title) + '\n\n' + chalk.white(message),
            {
                padding: 1,
                borderColor: 'blue',
                borderStyle: 'round',
                margin: { top: 1, bottom: 1 },
                textAlignment: 'center'
            }
        );
        console.log(box);
    }

    static async countdown(seconds, message = 'Starting in') {
        for (let i = seconds; i > 0; i--) {
            process.stdout.write(`\r${chalk.yellow(`⏳ ${message} ${i} seconds...`)}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
    }

    static progressBar(current, total, width = 40, label = 'Progress') {
        const percentage = Math.min(100, Math.max(0, (current / total) * 100));
        const filledLength = Math.round((width * current) / total);
        const bar = '█'.repeat(filledLength) + '░'.repeat(width - filledLength);
        
        return `${chalk.blue(label)}: [${chalk.green(bar)}] ${chalk.yellow(percentage.toFixed(1))}% (${current}/${total})`;
    }

    static displayProgressBar(current, total, width = 40, label = 'Progress') {
        const progressText = this.progressBar(current, total, width, label);
        process.stdout.write('\r' + progressText);
        
        if (current === total) {
            process.stdout.write('\n');
        }
    }

    static async simulateLoading(duration = 2000, message = 'Loading') {
        const spinner = this.createSpinner(message);
        spinner.start();
        
        await new Promise(resolve => setTimeout(resolve, duration));
        spinner.stop();
    }

    static flashMessage(message, duration = 1000, color = 'green') {
        console.log(chalk[color].bold(`\n✨ ${message} ✨\n`));
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    static createHeader(title, subtitle = '', borderColor = 'cyan') {
        const header = boxen(
            chalk[borderColor].bold(title) + (subtitle ? '\n' + chalk.gray(subtitle) : ''),
            {
                padding: 1,
                borderColor: borderColor,
                borderStyle: 'round',
                margin: { bottom: 1 },
                textAlignment: 'center'
            }
        );
        console.log(header);
    }

    static async typingEffect(text, speed = 50, prefix = '') {
        if (prefix) {
            process.stdout.write(prefix);
        }
        
        for (let char of text) {
            process.stdout.write(char);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
        process.stdout.write('\n');
    }
}

// Export individual functions for easier use
export const displayBanner = Animations.displayBanner.bind(Animations);
export const createSpinner = Animations.createSpinner.bind(Animations);
export const successBox = Animations.successBox.bind(Animations);
export const errorBox = Animations.errorBox.bind(Animations);
export const warningBox = Animations.warningBox.bind(Animations);
export const infoBox = Animations.infoBox.bind(Animations);
export const countdown = Animations.countdown.bind(Animations);
export const progressBar = Animations.progressBar.bind(Animations);
export const displayProgressBar = Animations.displayProgressBar.bind(Animations);
