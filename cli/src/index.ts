#!/usr/bin/env node
import { Command } from "commander";
import { dustCommand } from "./commands/dust.js";

const program = new Command();

program
  .name("solprivacy")
  .description("SolPrivacy CLI - Privacy tools for Solana wallets")
  .version("1.0.0");

// Add dust command
program.addCommand(dustCommand);

program.parse();
