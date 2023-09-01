import chalk from "chalk";

import {createRequire} from "module";
const require = createRequire(import.meta.url);

let Table = require("cli-table3");

export default function balanceCommand(argv, data, validAccounts) {
  argv._.shift();

  let params = argv._.map((e) => e.slice(0, -1));
  let allPostings = [];
  let allTransactions = [];
  let totals = {};

  for (const account in data) {
    allPostings = allPostings.concat(data[account].postings);
  }

  for (const account in data) {
    allTransactions = allTransactions.concat(data[account].transactions);
  }

  let accounts = [];
  let commodities = [];

  const validCommodities = ["Asset", "Bank"];

  while (params.length) {
    if (validAccounts.includes(params[0])) {
      accounts.push(params.shift());
    } else if (validCommodities.includes(params[0])) {
      commodities.push(params.shift());
    } else {
      params.shift();
    }
  }

  const commoditiesBalances = getCommoditiesBalance(allTransactions);
  const balances = getBalances(allPostings, data);

  //Create the table to show information

  var accountsTable = new Table({
    chars: {
      top: "",
      "top-mid": "",
      "top-left": "",
      "top-right": "",
      bottom: "",
      "bottom-mid": "",
      "bottom-left": "",
      "bottom-right": "",
      left: "",
      "left-mid": "",
      mid: "",
      "mid-mid": "",
      right: "",
      "right-mid": "",
      middle: " ",
    },
    style: {"padding-left": 0, "padding-right": 0},
    colWidths: [15, 30],
  });

  var commoditiesTable = new Table({
    chars: {
      top: "",
      "top-mid": "",
      "top-left": "",
      "top-right": "",
      bottom: "",
      "bottom-mid": "",
      "bottom-left": "",
      "bottom-right": "",
      left: "",
      "left-mid": "",
      mid: "",
      "mid-mid": "",
      right: "",
      "right-mid": "",
      middle: " ",
    },
    style: {"padding-left": 0, "padding-right": 0},
    colWidths: [15, 30],
  });

  if (accounts.length) {
    for (let i = 0; i < accounts.length; i++) {
      let amount = "";
      if (balances[accounts[i]]?.currency === "$") {
        amount = "$" + balances[accounts[i]].amount.toFixed(2);
      } else if (balances[accounts[i]].currency === "BTC") {
        amount = balances[accounts[i]].amount.toFixed(2) + " BTC";
      }
      accountsTable.push([
        {
          hAlign: "right",
          content:
            balances[accounts[i]].amount > 0 ? amount : chalk.red(amount),
        },
        chalk.blue(balances[accounts[i]].name),
      ]);

      if (totals[balances[accounts[i]].currency]) {
        totals[balances[accounts[i]].currency] +=
          balances[accounts[i]].amount * 1;
      } else {
        totals[balances[accounts[i]].currency] =
          balances[accounts[i]].amount * 1;
      }
    }

    console.log(accountsTable.toString());
  } else if (commodities.length) {
    if (accounts.length) {
      console.log("---------------");
    }
    for (let i = 0; i < commodities.length; i++) {
      commoditiesTable.push([
        {
          hAlign: "right",
          content:
            commoditiesBalances[commodities[i]].amount > 0
              ? commoditiesBalances[commodities[i]].currency === "$"
                ? "$" + commoditiesBalances[commodities[i]].amount.toFixed(2)
                : commoditiesBalances[commodities[i]].amount.toFixed(2) + " BTC"
              : chalk.red(
                  commoditiesBalances[commodities[i]].currency === "$"
                    ? "$" +
                        commoditiesBalances[commodities[i]].amount.toFixed(2)
                    : commoditiesBalances[commodities[i]].amount.toFixed(2) +
                        " BTC"
                ),
        },
        chalk.blue(
          Object.keys(commoditiesBalances)[i] +
            ":" +
            commoditiesBalances[commodities[i]].name
        ),
      ]);

      if (totals[commoditiesBalances[commodities[i]].currency]) {
        totals[commoditiesBalances[commodities[i]].currency] +=
          commoditiesBalances[commodities[i]].amount * 1;
      } else {
        totals[commoditiesBalances[commodities[i]].currency] =
          commoditiesBalances[commodities[i]].amount * 1;
      }
    }
    console.log(commoditiesTable.toString());
  } else {
    for (let i = 0; i < validAccounts.length; i++) {
      let amount = "";
      if (balances[validAccounts[i]]?.currency === "$") {
        amount = "$" + balances[validAccounts[i]].amount.toFixed(2);
      } else if (balances[validAccounts[i]].currency === "BTC") {
        amount = balances[validAccounts[i]].amount.toFixed(2) + " BTC";
      }
      accountsTable.push([
        {
          hAlign: "right",
          content:
            balances[validAccounts[i]].amount > 0 ? amount : chalk.red(amount),
        },
        chalk.blue(balances[validAccounts[i]].name),
      ]);

      if (totals[balances[validAccounts[i]].currency]) {
        totals[balances[validAccounts[i]].currency] +=
          balances[validAccounts[i]].amount * 1;
      } else {
        totals[balances[validAccounts[i]].currency] =
          balances[validAccounts[i]].amount * 1;
      }
    }

    console.log(accountsTable.toString());
  }

  let totalsTable = new Table({
    chars: {
      top: "",
      "top-mid": "",
      "top-left": "",
      "top-right": "",
      bottom: "",
      "bottom-mid": "",
      "bottom-left": "",
      "bottom-right": "",
      left: "",
      "left-mid": "",
      mid: "",
      "mid-mid": "",
      right: "",
      "right-mid": "",
      middle: " ",
    },
    style: {"padding-left": 0, "padding-right": 0},
    colWidths: [15, 30],
  });
  for (const account in totals) {
    totalsTable.push([
      {
        hAlign: "right",
        content:
          account === "$"
            ? totals[account] > 0
              ? `${account}${totals[account].toFixed(2)}`
              : totals[account] < 0
              ? chalk.red(`${account}${totals[account].toFixed(2)}`)
              : 0
            : account === "BTC"
            ? totals[account] > 0
              ? `${totals[account].toFixed(2)} ${account}`
              : totals[account] < 0
              ? chalk.red(`${totals[account].toFixed(2)} ${account}`)
              : 0
            : null,
      },
    ]);
  }
  console.log("---------------");
  console.log(totalsTable.toString());
}

function getCommoditiesBalance(allTransactions) {
  const commoditiesBalances = {
    Bank: {
      name: "Paypal",
      currency: "$",
      amount: 0,
    },
    Asset: {
      name: "Bitcoin Wallet",
      currency: "BTC",
      amount: 0,
    },
  };

  for (const account in commoditiesBalances) {
    let commodity = account + ":" + commoditiesBalances[account].name;
    for (let i = 0; i < allTransactions.length; i++) {
      if (allTransactions[i].account === commodity) {
        commoditiesBalances[account].amount += allTransactions[i].amount * 1;
      }
    }
  }
  return commoditiesBalances;
}

function getBalances(allPostings, data) {
  const balances = {};
  for (const accountName in data) {
    const account = data[accountName];
    balances[accountName] = {
      name: "",
      amount: 0,
      currency: "",
    };
    account.postings.forEach((element) => {
      balances[accountName].amount += element.amount;
      balances[accountName].name = element.account;
      balances[accountName].currency = element.currency;

      for (let i = 0; i < allPostings.length; i++) {
        if (element.account === allPostings[i].fromAccount) {
          let fromAmount = Number(allPostings[i].fromAmount);
          balances[accountName].amount += fromAmount;
        }
      }
    });
  }
  return balances;
}
