import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts"
import { privateKey } from "../generated/ethereumPrivatekey/ethereumPrivatekey"

export function createprivateKeyEvent(
  _user: Address,
  _privatekey: Bytes,
  _isUsed: boolean
): privateKey {
  let privateKeyEvent = changetype<privateKey>(newMockEvent())

  privateKeyEvent.parameters = new Array()

  privateKeyEvent.parameters.push(
    new ethereum.EventParam("_user", ethereum.Value.fromAddress(_user))
  )
  privateKeyEvent.parameters.push(
    new ethereum.EventParam(
      "_privatekey",
      ethereum.Value.fromFixedBytes(_privatekey)
    )
  )
  privateKeyEvent.parameters.push(
    new ethereum.EventParam("_isUsed", ethereum.Value.fromBoolean(_isUsed))
  )

  return privateKeyEvent
}
