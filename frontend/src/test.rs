#![no_std]
#![no_main]

extern crate alloc; // 1. We must explicitly define the alloc crate

// 2. We update imports to include 'ToString' and the 'vec' module
use alloc::{
    string::{String, ToString}, 
    vec,
    vec::Vec, 
    format
};

use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{
    bytesrepr::{FromBytes, ToBytes},
    CLType, CLTyped, EntryPoint, EntryPointAccess, EntryPointType, EntryPoints, Key, Parameter,
    RuntimeArgs, URef, U256, runtime_args, ContractHash, ApiError,
};

// --- CONSTANTS ---
const DICT_DAOS: &str = "daos";
const DICT_PROPOSALS: &str = "proposals";
const DICT_VOTES: &str = "votes"; 

#[derive(Clone, PartialEq)]
pub struct DAOStruct {
    pub name: String,
    pub token_address: Key,
    pub min_quorum: U256,
}

#[no_mangle]
pub extern "C" fn init() {
    storage::new_dictionary(DICT_DAOS).unwrap_or_revert();
    storage::new_dictionary(DICT_PROPOSALS).unwrap_or_revert();
    storage::new_dictionary(DICT_VOTES).unwrap_or_revert();
}

#[no_mangle]
pub extern "C" fn create_dao() {
    let name: String = runtime::get_named_arg("name");
    let token_address: Key = runtime::get_named_arg("token_address");
    
    // Generate a pseudo-random ID based on block time
    let dao_id: u64 = runtime::get_blocktime().into(); 
    
    // Store DAO metadata 
    // FIXED: .to_string() will now work because we imported ToString above
    let daos_dict = runtime::get_key(DICT_DAOS).unwrap().into_uref().unwrap();
    storage::dictionary_put(daos_dict, &dao_id.to_string(), token_address);
    
    // Emit event
    let event_key = format!("event_dao_created_{}", dao_id);
    runtime::put_key(&event_key, storage::new_uref(name).into());
}

#[no_mangle]
pub extern "C" fn vote() {
    let dao_id: u64 = runtime::get_named_arg("dao_id");
    let proposal_id: u64 = runtime::get_named_arg("proposal_id");
    let choice: bool = runtime::get_named_arg("choice");
    let voter: Key = runtime::get_caller().into();

    // 1. Check if already voted
    let votes_dict = runtime::get_key(DICT_VOTES).unwrap().into_uref().unwrap();
    let vote_key = format!("{}_{}_{}", dao_id, proposal_id, voter);
    
    // Note: In strict no_std, complex dictionary checks can be tricky. 
    // We check if the key exists by trying to read it.
    if let Ok(Some(_)) = storage::dictionary_get::<bool>(votes_dict, &vote_key) {
        runtime::revert(ApiError::User(1)); // Already voted
    }

    // 2. Get DAO Token Address
    let daos_dict = runtime::get_key(DICT_DAOS).unwrap().into_uref().unwrap();
    
    // FIXED: .to_string() works here too
    let token_key: Key = storage::dictionary_get(daos_dict, &dao_id.to_string())
        .unwrap_or_revert()
        .unwrap_or_revert();

    // 3. Cross-Contract Call: Check Balance
    let token_hash = match token_key {
        Key::Hash(h) => ContractHash::new(h),
        _ => runtime::revert(ApiError::User(2)),
    };

    let balance: U256 = runtime::call_contract(
        token_hash,
        "balance_of",
        runtime_args! { "address" => voter },
    );

    if balance == U256::zero() {
        runtime::revert(ApiError::User(3)); // No tokens = No vote
    }

    // 4. Record Vote
    storage::dictionary_put(votes_dict, &vote_key, true);
    
    // 5. Emit Event
    let event_key = format!("event_vote_{}_{}_{}", dao_id, proposal_id, voter);
    runtime::put_key(&event_key, storage::new_uref(choice).into());
}

#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();
    
    // --- FIX: Add the 'init' entry point so we can call it below ---
    entry_points.add_entry_point(EntryPoint::new(
        "init",
        vec![],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Existing 'create_dao' entry point
    entry_points.add_entry_point(EntryPoint::new(
        "create_dao",
        vec![
            Parameter::new("name", CLType::String),
            Parameter::new("token_address", CLType::Key),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Existing 'vote' entry point
    entry_points.add_entry_point(EntryPoint::new(
        "vote",
        vec![
            Parameter::new("dao_id", CLType::U64),
            Parameter::new("proposal_id", CLType::U64),
            Parameter::new("choice", CLType::Bool),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    let (contract_hash, _version) = storage::new_contract(
        entry_points,
        None,
        Some("casper_dao_package".to_string()),
        Some("access_token".to_string()),
    );
    
    // Store the contract hash so we can find it later
    runtime::put_key("casper_dao_contract", contract_hash.into());
    
    // Now this call will work because "init" is registered above!
    let _ : () = runtime::call_contract(contract_hash, "init", runtime_args! {});
}