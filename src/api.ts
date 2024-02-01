import { WsProvider, ApiPromise } from '@polkadot/api';
import { BN, BN_ONE } from "@polkadot/util";
import { signerAddress } from './keys';
import chalk from 'chalk';
const { PROVIDER_URL } = process.env
const provider = new WsProvider(PROVIDER_URL);
export const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
export const PROOFSIZE = new BN(119903836479112);
export const STORAGE_DEPOSIT_LIMIT = null;


export function getApi(): Promise<ApiPromise> {
   return ApiPromise.create({ provider: provider })
}



export function checkBalance(): Promise<void> {
   return getApi().then((api) => {
      return api.query.system.account(signerAddress).then((balance) => {
         const balanceData = balance.toJSON() as any
         if (balanceData.data.free === 0) {
            console.log('you can not execute a transaction without funds.')
            throw new Error(chalk.red('INSUFFICIENT_BALANCE'))
         }
      })
   })
}