var log = console.log;
var info = console.info;
var warn = console.warn;
var debug = console.debug;
var error = console.error;

const colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    fg: {
        Black: "\x1b[30m",
        Red: "\x1b[31m",
        Green: "\x1b[32m",
        Yellow: "\x1b[33m",
        Blue: "\x1b[34m",
        Magenta: "\x1b[35m",
        Cyan: "\x1b[36m",
        White: "\x1b[37m",
        Crimson: "\x1b[38m"
    },
    bg: {
        Black: "\x1b[40m",
        Red: "\x1b[41m",
        Green: "\x1b[42m",
        Yellow: "\x1b[43m",
        Blue: "\x1b[44m",
        Magenta: "\x1b[45m",
        Cyan: "\x1b[46m",
        White: "\x1b[47m",
        Crimson: "\x1b[48m"
    }
};

const textEffects = {
    Reset: "\x1b[0m",
    Bold: "\x1b[1m"
}

export class Swaggify {
    constructor() {
        console.log = (...args: any[]) => {
            const preface = `${colors.fg.Green}[${Date.now()}]${colors.Reset} ${colors.bg.Green + textEffects.Bold}  LOGS  ${colors.Reset}`;
            log.apply(console, [preface, ...args]);
        };

        console.info = (...args: any[]) => {
            const preface = `${colors.fg.White}[${Date.now()}]${colors.Reset} ${colors.bg.White + textEffects.Bold}  INFO  ${colors.Reset}`;
            info.apply(console, [preface, ...args]);
        };

        console.warn = (...args: any[]) => {
            const preface = `${colors.fg.Yellow}[${Date.now()}]${colors.Reset} ${colors.bg.Yellow + textEffects.Bold}  WARN  ${colors.Reset}`;
            warn.apply(console, [preface, ...args]);
        };

        console.debug = (...args: any[]) => {
            const preface = `${colors.fg.Red}[${Date.now()}]${colors.Reset} ${colors.bg.Blue + textEffects.Bold}  DBUG  ${colors.Reset}`;
            debug.apply(console, [preface, ...args]);
        };

        console.error = (...args: any[]) => {
            const preface = `${colors.fg.Green}[${Date.now()}]${colors.Reset} ${colors.bg.Red + textEffects.Bold}  FAIL  ${colors.Reset}`;
            error.apply(console, [preface, ...args]);
        };
    }
}
