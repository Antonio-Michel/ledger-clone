import chalk from "chalk";

import {createRequire} from "module";
const require = createRequire(import.meta.url);

let Table = require("cli-table3");

const months = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

export default function registerCommand(argv, data) {
  let currBalance = {};
  let walletBTC = 0;
  let fromWalletBTC = 0;
  let paypalAcct = 0;
  let fromPaypalAcct = 0;
  let allPostings = [];
  for (const commodity in data) {
    for (let i = 0; i < data[commodity].postings.length; i++) {
      allPostings.push(data[commodity].postings[i]);
    }
  }
  if (argv.sort === true) {
    console.log(
      chalk.yellow("For --sort flag you must add an option (d for date)")
    );
    return;
  }

  if (argv.sort === "d") {
    allPostings = allPostings.sort(function (a, b) {
      let dateA = new Date(a.date);
      let dateB = new Date(b.date);

      if (dateA < dateB) {
        return -1;
      }
      if (dateA > dateB) {
        return 1;
      }
      return 0;
    });
  }

  var table = new Table({
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
    colWidths: [10, 26, 30, 10, 15],
  });

  for (let i = 0; i < allPostings.length; i++) {
    if (allPostings[i].currency === "$") {
      paypalAcct = fromPaypalAcct * 1 + allPostings[i].amount * 1;
      if (allPostings[i].fromCurrency === "$") {
        fromPaypalAcct = paypalAcct * 1 + allPostings[i].fromAmount * 1;
      } else if (allPostings[i].fromCurrency === "BTC") {
        fromWalletBTC = walletBTC * 1 + allPostings[i].fromAmount * 1;
      }
    }
    if (allPostings[i].currency === "BTC") {
      walletBTC = fromWalletBTC * 1 + allPostings[i].amount * 1;
      if (allPostings[i].fromCurrency === "$") {
        fromPaypalAcct = paypalAcct * 1 + allPostings[i].fromAmount * 1;
      } else if (allPostings[i].fromCurrency === "BTC") {
        fromWalletBTC = walletBTC * 1 + allPostings[i].fromAmount * 1;
      }
    }

    let date = allPostings[i].date.toISOString().substring(0, 10).split("-");
    table.push([
      chalk.grey(date[0].slice(2) + "-" + months[date[1]] + "-" + date[2]),
      allPostings[i].description,
      chalk.blue(allPostings[i].account),
      {
        hAlign: "right",
        content:
          allPostings[i].currency === "$"
            ? allPostings[i].amount >= 0
              ? chalk.white(
                  allPostings[i].currency + allPostings[i].amount.toFixed(2)
                )
              : chalk.red(
                  allPostings[i].currency + allPostings[i].amount.toFixed(2)
                )
            : allPostings[i].amount >= 0
            ? chalk.white(
                allPostings[i].amount.toFixed(1) + " " + allPostings[i].currency
              )
            : chalk.red(
                allPostings[i].amount.toFixed(1) + " " + allPostings[i].currency
              ),
      },
      {
        hAlign: "right",
        content:
          paypalAcct !== 0 && walletBTC !== 0
            ? `$${paypalAcct.toFixed(2)}\n${walletBTC.toFixed(1)} BTC`
            : paypalAcct !== 0
            ? paypalAcct > 0
              ? "$" + paypalAcct.toFixed(2)
              : chalk.red("$" + paypalAcct.toFixed(2))
            : walletBTC !== 0
            ? walletBTC > 0
              ? `${walletBTC} BTC`
              : chalk.red(`${walletBTC} BTC`)
            : 0,
      },
    ]);

    if (allPostings[i].fromCurrency === "$") {
      paypalAcct =
        allPostings[i].fromCurrency === "$" ? fromPaypalAcct : paypalAcct;
      fromWalletBTC = walletBTC;
    } else {
      walletBTC =
        allPostings[i].fromCurrency === "$" ? fromWalletBTC : walletBTC;
      fromPaypalAcct = paypalAcct;
    }

    table.push([
      "",
      "",
      chalk.blue(allPostings[i].fromAccount),
      {
        hAlign: "right",
        content:
          allPostings[i].fromCurrency === "$"
            ? allPostings[i].fromAmount >= 0
              ? chalk.white(
                  allPostings[i].fromCurrency +
                    Number(allPostings[i].fromAmount).toFixed(2)
                )
              : chalk.red(
                  allPostings[i].fromCurrency +
                    Number(allPostings[i].fromAmount).toFixed(2)
                )
            : allPostings[i].fromAmount >= 0
            ? chalk.white(
                Number(allPostings[i].fromAmount).toFixed(1) +
                  " " +
                  allPostings[i].fromCurrency
              )
            : chalk.red(
                Number(allPostings[i].fromAmount).toFixed(1) +
                  " " +
                  allPostings[i].fromCurrency
              ),
      },
      {
        hAlign: "right",
        content:
          fromPaypalAcct !== 0 && fromWalletBTC !== 0
            ? `$${fromPaypalAcct.toFixed(2)}\n${fromWalletBTC.toFixed(1)} BTC`
            : fromPaypalAcct !== 0
            ? fromPaypalAcct > 0
              ? "$" + fromPaypalAcct.toFixed(2)
              : chalk.red("$" + fromPaypalAcct.toFixed(2))
            : fromWalletBTC !== 0
            ? fromWalletBTC > 0
              ? `${fromWalletBTC} BTC`
              : chalk.red(`${fromWalletBTC} BTC`)
            : 0,
      },
    ]);
  }
  console.log(table.toString());
  return;
}
