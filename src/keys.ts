import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';
import fs from 'fs';
import chalk from 'chalk';
import { checkBalance, getApi } from './api';
const sr25519Keyring = new Keyring({ type: 'sr25519' });
export let signerAddress = ''
const ed25519Keyring = new Keyring({ type: 'ed25519' });
const { KEYSTORE_PATH } = process.env;
export async function getKeyFiles(): Promise<{ granFile: string, auraFile: string }> {
   console.log(chalk.blue('checking for keys...'))
   return new Promise((resolve, reject) => {
      fs.readdir(KEYSTORE_PATH!, (err: any, fileNames: any) => {
         let keysFiles = { granFile: '', auraFile: '' };
         if (!fileNames || (fileNames && fileNames.length === 0)) {
            reject(new Error(`${chalk.red('NO_KEYS_FOUND')} No keys found in path ${KEYSTORE_PATH}`))
         }
         else {
            const grandpaFile = fileNames.find((file: any) => file.startsWith('6772'));
            keysFiles.granFile = grandpaFile;
            if (!grandpaFile) {
               reject(new Error(`${chalk.red('NO_GRANDPA_KEY')}: Grandpa key not found in path ${KEYSTORE_PATH}`));
            }

            const auraFile = fileNames.find((file: any) => file.startsWith('6175'));
            keysFiles.auraFile = auraFile;
            if (!auraFile) {
               reject(new Error(`${chalk.red('NO_AURA_KEY')}: Aura key not found in path ${KEYSTORE_PATH}`));
            }
            if (auraFile && grandpaFile) {
               console.log(chalk.green('Keys found! proceed...'));
            }
         }

         if (err) {
            reject(new Error(`${chalk.red('KEYSTORE_PATH_ERROR')}: ${err.message}`));
         }
         resolve(keysFiles);
      });
   })
}

export function getPublicKeys(keyFiles: { granFile: string, auraFile: string }) {
   let grandpaFileContent = fs.readFileSync(`${KEYSTORE_PATH}/${keyFiles.granFile}`, 'utf-8');
   let auraKeyFileContent = fs.readFileSync(`${KEYSTORE_PATH}/${keyFiles.auraFile}`, 'utf-8');
   const grandpaKey = grandpaFileContent.slice(1, -1);
   const auraKey = auraKeyFileContent.slice(1, -1);
   const grandpaPair: KeyringPair = ed25519Keyring.addFromUri(grandpaKey);
   const auraPair = sr25519Keyring.addFromUri(auraKey);
   signerAddress = auraPair.address;
   validateKeys(grandpaPair, auraPair)
   return { granPublicKey: u8aToHex(grandpaPair.publicKey), auraPublicKey: u8aToHex(auraPair.publicKey) };
}

function validateKeys(grandpaKey: KeyringPair, auraKey: KeyringPair) {
   if (grandpaKey.publicKey === auraKey.publicKey) {
      console.log(`${chalk.red('ATTENTION')}\n`)
      console.log(chalk.red('-------------------------------------------------'))
      console.log(`make sure ${chalk.green('GRANDPA_KEY')} was made with \n`)
      console.log(`d9-node key generate --scheme Ed25519 \n`)
      console.log(`and make sure  ${chalk.green('AURA_KEY')} was made with \n`)
      console.log(`d9-node key generate --scheme Sr25519\n`)
      console.log(chalk.red('-------------------------------------------------\n'))
      console.log(chalk.red('Error is below:'))
      throw new Error(`${chalk.red('INVALID_KEY_SET')}: Grandpa and Aura keys cannot be the same`);
   }
   if (grandpaKey.type !== 'ed25519') {
      console.log(`your grandpa key  type is ${chalk.red(grandpaKey.type)}. it should be ${chalk.green('ed25519')}`)
      throw new Error(`${chalk.red('INVALID_GRANDPA_KEY')}: Grandpa key must be of type ed25519`);
   }
   if (auraKey.type !== 'sr25519') {
      console.log(`aura type is ${chalk.red(auraKey.type)}. it should be ${chalk.green('sr25519')}`)
      throw new Error(`${chalk.red('INVALID_AURA_KEY')}: Aura key must be of type sr25519`);
   }
}

export async function registerKeys(publicKeys: { granPublicKey: string, auraPublicKey: string }) {
   console.log('registering keys...')
   const api = await getApi()
   const keys = {
      aura: publicKeys.auraPublicKey,
      grandpa: publicKeys.granPublicKey,
      imOnline: publicKeys.auraPublicKey,
      authorityDiscovery: publicKeys.auraPublicKey
   }
   await checkBalance()
   console.log(`keys that will be registered:\n ${JSON.stringify(keys, null, 2)}`)
   const tx: SubmittableExtrinsic<'promise'> = api.tx.session.setKeys(keys, '0x00');
   return new Promise((resolve, reject) => {
      const signingKey = sr25519Keyring.getPair(signerAddress);
      tx.signAndSend(signingKey, (result) => {
         if (result.status.isInBlock) {
            console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
         } else if (result.status.isFinalized) {
            console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
            resolve(result)
         } else if (result.status.isUsurped) {
            console.log(`Transaction usurped at blockHash ${result.status.asUsurped}`);
            reject(result)
         } else if (result.status.isRetracted) {
            console.log(`Transaction retracted at blockHash ${result.status.asRetracted}`);
            reject(result)
         } else if (result.status.isBroadcast) {
            console.log(`Transaction broadcast at blockHash ${result.status.asBroadcast}`);
         }
      })
   })

}