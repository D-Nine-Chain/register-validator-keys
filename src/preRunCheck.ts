import 'dotenv/config'
import chalk from "chalk"
import { getKeyFiles, getPublicKeys, signerAddress } from "./keys"
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { checkBalance } from './api';

void (async () => {
   try {
      await cryptoWaitReady();
      const keyFiles = await getKeyFiles()
      const _ = await getPublicKeys(keyFiles)
      console.log(`this node's address is ${chalk.blue('NODE_ADDRESS')}: ${chalk.green(signerAddress)}`)
      await checkBalance()
      console.log(chalk.green('OKAY'))
      console.log(`no issues. please run ${chalk.green('npm run prod')} to register the node key.`)
      process.exit(0)

   } catch (e) {
      console.error(e)

   }
})()