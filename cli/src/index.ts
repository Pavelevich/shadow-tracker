#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { interactiveMode } from "./commands/interactive.js";

const VERSION = "1.0.0";

// Cat ASCII Art Logo
const brandName = chalk.magenta("P") + chalk.cyan("R") + chalk.yellow("I") + chalk.green("V") + chalk.red("A") + chalk.blue("T") + chalk.magenta("E") +
                  chalk.gray(" ") +
                  chalk.cyan("P") + chalk.yellow("U") + chalk.green("S") + chalk.red("S") + chalk.blue("Y");

const logo = `
${chalk.cyan("         ,_     _")}
${chalk.cyan("         |\\\\,-~/")}
${chalk.cyan("         / _  _ |    ,--.")}
${chalk.cyan("        (  ") + chalk.green("@") + chalk.cyan("  ") + chalk.green("@") + chalk.cyan(" )   / ,-'")}
${chalk.cyan("         \\  _T_/-._( (")}
${chalk.cyan("         /         \`. \\")}
${chalk.cyan("        |         _  \\ |")}
${chalk.cyan("         \\ \\ ,  /      |")}
${chalk.cyan("          || |-_\\__   /")}
${chalk.cyan("         ((_/\`(____,-'")}

          ${brandName}
${chalk.gray("      ZK Privacy for Solana")}
`;

const program = new Command();

program
  .name("privatepussy")
  .description("PRIVATE PUSSY - ZK Privacy tools for Solana")
  .version(VERSION)
  .addHelpText("before", logo);

// Add interactive command (default when no args)
program
  .command("start", { isDefault: true })
  .description("Start interactive mode")
  .action(async () => {
    console.log(logo);
    await interactiveMode();
  });

// Parse arguments
const args = process.argv.slice(2);

// If no arguments, show interactive mode
if (args.length === 0) {
  console.log(logo);
  interactiveMode();
} else {
  program.parse();
}
