import 'dotenv/config'
import { getKeyFiles, getPublicKeys, registerKeys } from "./keys";
import chalk from 'chalk';
import { cryptoWaitReady } from '@polkadot/util-crypto';

void (async () => {
   try {
      await cryptoWaitReady();
      const keyFiles = await getKeyFiles();
      const publicKeys = getPublicKeys(keyFiles);
      console.log("public keys", publicKeys)
      await registerKeys(publicKeys)
      process.exit(1);
   }
   catch (e: any) {
      console.error(e);
      process.exit(1);
   }
})()


//todo  need a condition for when  gran and aura are the same
// todo need a condition for when there are more than one files