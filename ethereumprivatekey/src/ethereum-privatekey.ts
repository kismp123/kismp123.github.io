import { privateKey as privateKeyEvent } from "../generated/ethereumPrivatekey/ethereumPrivatekey"
import { privateKey } from "../generated/schema"

export function handleprivateKey(event: privateKeyEvent): void {
  let entity = new privateKey(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._user = event.params._user
  entity._privatekey = event.params._privatekey
  entity._isUsed = event.params._isUsed

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
