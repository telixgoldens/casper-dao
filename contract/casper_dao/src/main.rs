#![no_std]
#![no_main]

extern crate alloc;
use alloc::{
    string::{String, ToString}, 
    vec,
    format
};

use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};

// FIX: We follow the compiler's explicit instructions for v6.1.0 imports
use casper_types::{
    CLType, Key, Parameter, U256, runtime_args, ApiError,
    EntryPointAccess, EntryPointType,
    EntryPoints,
    contracts::EntryPoint, contracts::ContractHash,
    U512,
};

use casper_types::account::AccountHash;

// --- CONSTANTS ---
const DICT_DAOS: &str = "daos";
const DICT_DAO_TYPES: &str = "dao_types";
const DICT_PROPOSALS: &str = "proposals";
const DICT_VOTES: &str = "votes"; 

#[no_mangle]
pub extern "C" fn init() {
    storage::new_dictionary(DICT_DAOS).unwrap_or_revert();
    storage::new_dictionary(DICT_DAO_TYPES).unwrap_or_revert();
    storage::new_dictionary(DICT_PROPOSALS).unwrap_or_revert();
    storage::new_dictionary(DICT_VOTES).unwrap_or_revert();
}

#[no_mangle]
pub extern "C" fn create_dao() {
    let name: String = runtime::get_named_arg("name");
    let token_address: Key = runtime::get_named_arg("token_address");
    // token_type argument (must be provided by caller)
    let token_type: String = runtime::get_named_arg("token_type");
    let dao_id: u64 = runtime::get_blocktime().into(); 
    
    // Store DAO
    let daos_dict = runtime::get_key(DICT_DAOS).unwrap().into_uref().unwrap();
    storage::dictionary_put(daos_dict, &dao_id.to_string(), token_address);
    let dao_types = runtime::get_key(DICT_DAO_TYPES).unwrap().into_uref().unwrap();
    storage::dictionary_put(dao_types, &dao_id.to_string(), token_type);
    
    // Emit event
    let event_key = format!("event_dao_created_{}", dao_id);
    runtime::put_key(&event_key, storage::new_uref(name).into());
}

#[no_mangle]
pub extern "C" fn vote() {
    let dao_id: u64 = runtime::get_named_arg("dao_id");
    let proposal_id: u64 = runtime::get_named_arg("proposal_id");
    let choice: bool = runtime::get_named_arg("choice");
    // caller info
    let caller: AccountHash = runtime::get_caller();
    let voter: Key = Key::Account(caller);

    let votes_dict = runtime::get_key(DICT_VOTES).unwrap().into_uref().unwrap();
    let vote_key = format!("{}_{}_{}", dao_id, proposal_id, voter);
    
    if let Ok(Some(_)) = storage::dictionary_get::<bool>(votes_dict, &vote_key) {
        runtime::revert(ApiError::User(1)); 
    }

    let daos_dict = runtime::get_key(DICT_DAOS).unwrap().into_uref().unwrap();
    let token_key: Key = storage::dictionary_get(daos_dict, &dao_id.to_string())
        .unwrap_or_revert()
        .unwrap_or_revert();

    // read token_type for this DAO (default to u512_owner)
    let dao_types = runtime::get_key(DICT_DAO_TYPES).unwrap().into_uref().unwrap();
    let token_type_opt: Option<String> = storage::dictionary_get(dao_types, &dao_id.to_string()).unwrap_or_revert();
    let token_type = token_type_opt.unwrap_or("u512_owner".to_string());

    let token_hash = match token_key {
        Key::Hash(h) => ContractHash::new(h),
        _ => runtime::revert(ApiError::User(2)),
    };

    // Branch by token ABI type
    if token_type == "u512_owner" {
        // call token.balance_of(owner: AccountHash) -> U512
        let owner: AccountHash = caller;
        let balance: U512 = runtime::call_contract(
            token_hash,
            "balance_of",
            runtime_args! { "owner" => owner },
        );
        if balance == U512::zero() {
            runtime::revert(ApiError::User(3));
        }
    } else if token_type == "u256_address" {
        // call token.balance_of(address: Key) -> U256
        let balance: U256 = runtime::call_contract(
            token_hash,
            "balance_of",
            runtime_args! { "address" => voter },
        );
        if balance == U256::zero() {
            runtime::revert(ApiError::User(3));
        }
    } else {
        // unknown token type; revert
        runtime::revert(ApiError::User(4));
    }

    storage::dictionary_put(votes_dict, &vote_key, true);
    
    let event_key = format!("event_vote_{}_{}_{}", dao_id, proposal_id, voter);
    runtime::put_key(&event_key, storage::new_uref(choice).into());
}

#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();
    
    entry_points.add_entry_point(EntryPoint::new(
        "init",
        vec![],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());

    entry_points.add_entry_point(EntryPoint::new(
        "create_dao",
        vec![
            Parameter::new("name", CLType::String),
            Parameter::new("token_address", CLType::Key),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());

    entry_points.add_entry_point(EntryPoint::new(
        "vote",
        vec![
            Parameter::new("dao_id", CLType::U64),
            Parameter::new("proposal_id", CLType::U64),
            Parameter::new("choice", CLType::Bool),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());

    // Install Contract
    let (contract_hash, _version) = storage::new_contract(
        entry_points,
        None,
        Some("casper_dao_v2_package".to_string()),
        Some("casper_dao_v2_access".to_string()),
        None,
    );
    
    runtime::put_key("casper_dao_contract", contract_hash.into());
}