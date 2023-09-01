#!/usr/bin/env node

/**
 * File parsing still has an error in which it return the wrong currency
 * for one of the test files
 *
 * Sorting currently only works for date in an ascending order
 *
 * There is also still a bug in the register command in which after having
 * more than one currency the newest currency is losing its value
 */

import * as fs from "fs";
import yargs from "yargs";
const {argv} = yargs(process.argv.slice(2));

import {getTransactions, getPostings, getPrices} from "./readFiles.js";
import printCommand from "./print.js";
import registerCommand from "./register.js";
import balanceCommand from "./balance.js";

const path = "./data/";

let files = fs.readdirSync("./data");

let validAccounts = [];

files.forEach((file) => {
  if (file[0] === file[0].toUpperCase()) {
    validAccounts.push(file.substring(0, file.indexOf(".")));
  }
});

const balance = ["balalance", "bal", "b", "Balance", "Bal", "B"];
const print = ["print", "p", "Print", "P"];
const register = ["register", "reg", "r", "Register", "Reg", "R"];

//the implementation of exhange rates from prices-db file is still missing
const prices = getPrices();

let data = {};

for (let i = 0; i < files.length; i++) {
  if (files[i].includes(".ledger") && files[i].split(".")[0] !== "index") {
    let string = files[i].split(".")[0];
    data[string] = {
      transactions: getTransactions(path + files[i]),
      postings: getPostings(path + files[i]),
    };
  }
}

if (argv._.some((i) => print.includes(i))) {
  printCommand(argv, data);
} else if (argv._.some((i) => register.includes(i))) {
  registerCommand(argv, data);
} else if (argv._.some((i) => balance.includes(i))) {
  balanceCommand(argv, data, validAccounts);
}
