import chalk from "chalk";

export default function printCommand(argv, data) {
  let allPostings = [];
  for (const commodity in data) {
    for (let i = 0; i < data[commodity].postings.length; i++) {
      allPostings.push(data[commodity].postings[i]);
    }
  }
  if (argv.sort === true) {
    console.log(
      chalk.yellow(
        "For --sort flag you must add an option (d for date or a for amount)"
      )
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

  for (let i = 0; i < allPostings.length; i++) {
    const element = allPostings[i];
    console.log(
      allPostings[i].date.toISOString().substring(0, 10).replaceAll("-", "/") +
        " " +
        allPostings[i].description
    );
    let start = allPostings[i].account;

    let end =
      allPostings[i].currency === "$"
        ? "$" + allPostings[i].amount.toFixed(2)
        : allPostings[i].amount + " BTC";

    let spacing = 4 + start.length + end.length;

    let str1 = "    " + start + " ".repeat(52 - spacing) + end;

    let start2 = allPostings[i].fromAccount;

    let end2 = allPostings[i].hasFrom
      ? allPostings[i].currency === "$"
        ? "$" + allPostings[i].amount
        : allPostings[i].amount + " BTC"
      : "";

    let str2 = "    " + start2 + " ".repeat(52 - spacing) + end2;
    console.log(str1 + "\n" + str2 + "\n");
  }

  return;
}
