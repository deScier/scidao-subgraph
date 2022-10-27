import { BigInt } from "@graphprotocol/graph-ts"
import {
  SubTests as TokenContract,
  ApprovalForAll,
  OwnershipTransferred,
  Submited,
  TransferBatch,
  TransferSingle,
  URI
} from "../generated/SubTests/SubTests"
import { ipfs, json, JSONValue,Bytes } from '@graphprotocol/graph-ts'


import { Submission,Token } from "../generated/schema"

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleSubmited(event: Submited): void {

  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let submission = Submission.load(event.params.uri)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!submission) {
    submission = new Submission(event.params.uri)
  }

  // BigInt and BigDecimal math are supported
  submission.approved = false;

  // Entity fields can be set based on event parameters
  submission.owner = event.params.from
  submission.uri = event.params.uri

  // Entities can be written to the store with `.save()`
  submission.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOf(...)
  // - contract.balanceOfBatch(...)
  // - contract.isApprovedForAll(...)
  // - contract.name(...)
  // - contract.owner(...)
  // - contract.price(...)
  // - contract.submissionAuthor(...)
  // - contract.supportsInterface(...)
  // - contract.symbol(...)
  // - contract.totalSupply(...)
  // - contract.uri(...)

}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {


  let token = Token.load(event.params.id.toString());
  if (!token) {
    token = new Token(event.params.id.toString());
    token.creator = event.params.to.toHexString();
    token.tokenID = event.params.id;
    token.supply = event.params.value;
    token.createdAtTimestamp = event.block.timestamp;
    token.creator = event.params.to.toHexString();
    let tokenContract = TokenContract.bind(event.address);
    token.metadataURI = tokenContract.uri(event.params.id);
    token.name = "";
    token.description = "";
    token.imageURI = "";
    let hash = token.metadataURI.split('ipfs://').join('')
    let data = ipfs.cat(hash);
    if(data){
      let value = json.fromBytes(data).toObject()

      let name = value.get('name');
      if(name){
        token.name = name.toString();
      }
      let description = value.get('description');
      if(description){
        token.description = description.toString();
      }
      let imageUri = value.get('image');
      if(imageUri){
        token.imageURI = imageUri.toString();
      }
    }
    token.save();
  }
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let submission = Submission.load(token.metadataURI.replace("ipfs://",""))

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!submission) {
    return
  }
  if(!submission.approved){
    submission.approved = true;

    submission.save()
  }


}

export function handleURI(event: URI): void {



}
