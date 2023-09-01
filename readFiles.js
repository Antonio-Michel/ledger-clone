import * as fs from "fs";

const POSTING_ENTRY_REGEX = /^(\d{4}\/\d{1,2}\/\d{1,2})\s+([\w\s]+)/;
const TRANSACTION_MATCH_REGEX =
  /^\s+([\w\s\w:]+)\s+(-?[$]?[\d,.]+)\s*([A-Z]{2,3})?/;
const POSTING_MATCH_REGEX =
  /^\s+([\w\s\w:]+)\s*(-?[$]?[\d,.]+)?\s*([A-Z]{2,3})?/;
const PRICES_DB_REGEX =
  /^P\s+\d{4}\/\d{1,2}\/\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+([A-Z]+)\s+[$]([\d.,]+)/;

export function parseFileContent(file) {
  try {
    const content = fs.readFileSync(file, `utf-8`);
    return content;
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(0);
  }
}

export function getTransactions(file, transactions = []) {
  const fileContent = parseFileContent(file);
  const lines = fileContent.split(`\n`);
  let transactionDate = ``;
  let transactionDescription = ``;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const postingEntryMatch = line.match(POSTING_ENTRY_REGEX);
    if (postingEntryMatch) {
      transactionDate = postingEntryMatch[1];
      transactionDescription = postingEntryMatch[2];
    }

    let transactionAmount = 0;
    const transactionMatch = line.match(TRANSACTION_MATCH_REGEX);
    if (transactionMatch) {
      transactionAmount = transactionMatch[2].replace(`$`, ``) * 1;

      transactions.push({
        account: transactionMatch[1].trim(),
        amount: transactionAmount,
        currency: transactionMatch[3] ? transactionMatch[3] : `$`,
        date: new Date(transactionDate),
        description: transactionDescription,
      });
    }

    let complementaryTransaction = {};
    if (i + 1 < lines.length) {
      complementaryTransaction = lines[i + 1].match(/^\s+([\w\s:]+)$/);
    }
    if (transactionMatch && complementaryTransaction) {
      transactions.push({
        account: complementaryTransaction[1].trim(),
        amount: -transactionAmount,
        currency: transactionMatch[3] ? transactionMatch[3] : `$`,
        date: new Date(transactionDate),
        description: transactionDescription,
      });
      i++;
    }
  }

  return transactions;
}

export function getPostings(file, postings = []) {
  const fileContent = parseFileContent(file);
  const lines = fileContent.split(`\n`);
  for (let i = 0; i < lines.length; i++) {
    const postingEntryMatch = lines[i].match(POSTING_ENTRY_REGEX);
    if (postingEntryMatch) {
      let transactionDate = postingEntryMatch[1];
      let transactionDescription = postingEntryMatch[2];

      const toAccountPostingMatch = lines[i + 1].match(TRANSACTION_MATCH_REGEX);
      const fromAccountPostingMatch = lines[i + 2].match(POSTING_MATCH_REGEX);
      let transactionAmount = toAccountPostingMatch[2].replace(`$`, ``) * 1;
      let amountComplement = fromAccountPostingMatch[2]
        ? fromAccountPostingMatch[2].replace(`$`, ``)
        : -transactionAmount;

      postings.push({
        account: toAccountPostingMatch[1].trim(),
        fromAccount: fromAccountPostingMatch[1].trim(),
        amount: transactionAmount,
        fromAmount: amountComplement,
        currency: toAccountPostingMatch[3] ? toAccountPostingMatch[3] : `$`,
        fromCurrency: fromAccountPostingMatch[3]
          ? fromAccountPostingMatch[3]
          : `$`,
        date: new Date(transactionDate),
        description: transactionDescription,
        hasFrom: fromAccountPostingMatch[3] ? true : false,
      });
      i = i + 2;
    }
  }
  return postings;
}

export function getPrices() {
  const prices = {};
  const content = parseFileContent(`data/prices_db`);
  const lines = content.split(`\n`);

  lines.forEach((line) => {
    const priceMatch = line.match(PRICES_DB_REGEX);
    if (priceMatch) {
      prices[priceMatch[1]] = priceMatch[2] * 1;
    }

    const baseMatch = line.match(/^D\s+[$]([\d.,]+)/);
    if (baseMatch) {
      prices[`$`] = baseMatch[1].replace(`,`, ``) * 1;
    }
  });

  return prices;
}

export const read = {
  getTransactions,
  parseFileContent,
  getPostings,
  getPrices,
};
