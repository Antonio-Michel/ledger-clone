# ledger-clone

This app is my own implementation of Ledger CLI, a double-entry accounting command line tool.

This implementation is very basic and at the moment only supports the commands `print`, `register` and `balance` with the possibility of adding a `--sort`flag
to order the Print and Register outputs in ascending date.

To make use of this software make sure to have Node.js installed, then run the `npm install`command to add all the dependencies needed and then simply type
`node index.js <command> <flags> <files>`, currently in this repo there are some demo files.

There are still some bugs in the Balance and Register commands which require some more time to solve.
