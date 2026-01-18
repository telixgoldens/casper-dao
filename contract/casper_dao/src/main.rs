#![no_std]
#![no_main]

extern crate alloc;
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
    CLType, Key, Parameter, U256, runtime_args, ApiError,
    EntryPointAccess, EntryPointType,
    EntryPoints,
    contracts::EntryPoint, contracts::ContractHash,
    U512, 
};
use casper_types::CLType::U64;

use casper_types::account::AccountHash;

const DICT_DAOS: &str = "daos";
const DICT_DAO_TYPES: &str = "dao_types";
const DICT_DAO_CREATORS: &str = "dao_creators";
const DICT_PROPOSALS: &str = "proposals";
const DICT_PROPOSAL_METADATA: &str = "proposal_metadata";
const DICT_VOTES: &str = "votes";
const DICT_VOTE_WEIGHTS: &str = "vote_weights";
const DICT_DAO_MEMBERS: &str = "dao_members";

const ERROR_ALREADY_VOTED: u16 = 1;
const ERROR_INVALID_TOKEN_KEY: u16 = 2;
const ERROR_NO_TOKENS: u16 = 3;
const ERROR_INVALID_TOKEN_TYPE: u16 = 4;
const ERROR_PROPOSAL_NOT_FOUND: u16 = 5;
const ERROR_VOTING_ENDED: u16 = 6;
const ERROR_VOTING_NOT_STARTED: u16 = 7;
const ERROR_NOT_DAO_CREATOR: u16 = 8;
const ERROR_DAO_NOT_FOUND: u16 = 9;

#[no_mangle]
pub extern "C" fn init() {
    storage::new_dictionary(DICT_DAOS).unwrap_or_revert();
    storage::new_dictionary(DICT_DAO_TYPES).unwrap_or_revert();
    storage::new_dictionary(DICT_DAO_CREATORS).unwrap_or_revert();
    storage::new_dictionary(DICT_PROPOSALS).unwrap_or_revert();
    storage::new_dictionary(DICT_PROPOSAL_METADATA).unwrap_or_revert();
    storage::new_dictionary(DICT_VOTES).unwrap_or_revert();
    storage::new_dictionary(DICT_VOTE_WEIGHTS).unwrap_or_revert();
    storage::new_dictionary(DICT_DAO_MEMBERS).unwrap_or_revert();
}

#[no_mangle]
pub extern "C" fn create_dao() {
    let name: String = runtime::get_named_arg("name");
    let token_address: Key = runtime::get_named_arg("token_address");
    let token_type: String = runtime::get_named_arg("token_type");
    let dao_id: u64 = runtime::get_blocktime().into();
    let creator: AccountHash = runtime::get_caller();
    
    let daos_dict = runtime::get_key(DICT_DAOS).unwrap().into_uref().unwrap();
    storage::dictionary_put(daos_dict, &dao_id.to_string(), token_address);
    
    let dao_types = runtime::get_key(DICT_DAO_TYPES).unwrap().into_uref().unwrap();
    storage::dictionary_put(dao_types, &dao_id.to_string(), token_type);
    
    let dao_creators = runtime::get_key(DICT_DAO_CREATORS).unwrap().into_uref().unwrap();
    storage::dictionary_put(dao_creators, &dao_id.to_string(), creator);
    
    let members_dict = runtime::get_key(DICT_DAO_MEMBERS).unwrap().into_uref().unwrap();
    storage::dictionary_put(members_dict, &dao_id.to_string(), 0u64);
    
    let event_key = format!("event_dao_created_{}", dao_id);
    runtime::put_key(&event_key, storage::new_uref(name).into());
}

#[no_mangle]
pub extern "C" fn create_proposal() {
    let dao_id: u64 = runtime::get_named_arg("dao_id");
    let title: String = runtime::get_named_arg("title");
    let description: String = runtime::get_named_arg("description");
    let voting_duration: u64 = runtime::get_named_arg("voting_duration"); 
    let creator: AccountHash = runtime::get_caller();
    
    let daos_dict = runtime::get_key(DICT_DAOS).unwrap().into_uref().unwrap();
    let _token_key: Option<Key> = storage::dictionary_get(daos_dict, &dao_id.to_string())
        .unwrap_or_revert();
    if _token_key.is_none() {
        runtime::revert(ApiError::User(ERROR_DAO_NOT_FOUND));
    }
    
    let dao_creators = runtime::get_key(DICT_DAO_CREATORS).unwrap().into_uref().unwrap();
    let dao_creator: Option<AccountHash> = storage::dictionary_get(dao_creators, &dao_id.to_string())
        .unwrap_or_revert();
    if dao_creator.is_none() || dao_creator.unwrap() != creator {
        runtime::revert(ApiError::User(ERROR_NOT_DAO_CREATOR));
    }
    
    let proposal_id: u64 = runtime::get_blocktime().into();
    let start_time: u64 = runtime::get_blocktime().into();
    let end_time: u64 = start_time + voting_duration;
    
    let proposals_dict = runtime::get_key(DICT_PROPOSALS).unwrap().into_uref().unwrap();
    let proposal_key = format!("{}_{}", dao_id, proposal_id);
    let proposal_data = format!("{}_{}_{}", start_time, end_time, creator);
    storage::dictionary_put(proposals_dict, &proposal_key, proposal_data);
    
    let metadata_dict = runtime::get_key(DICT_PROPOSAL_METADATA).unwrap().into_uref().unwrap();
    let metadata = format!("{}||{}", title, description);
    storage::dictionary_put(metadata_dict, &proposal_key, metadata);
    
    let event_key = format!("event_proposal_created_{}_{}", dao_id, proposal_id);
    runtime::put_key(&event_key, storage::new_uref(title).into());
}

#[no_mangle]
pub extern "C" fn vote() {
    let dao_id: u64 = runtime::get_named_arg("dao_id");
    let proposal_id: u64 = runtime::get_named_arg("proposal_id");
    let choice: bool = runtime::get_named_arg("choice");
    let caller: AccountHash = runtime::get_caller();
    let voter: Key = Key::Account(caller);
    let proposals_dict = runtime::get_key(DICT_PROPOSALS).unwrap().into_uref().unwrap();
    let proposal_key = format!("{}_{}", dao_id, proposal_id);
    let proposal_data: Option<String> = storage::dictionary_get(proposals_dict, &proposal_key)
        .unwrap_or_revert();
    
    if proposal_data.is_none() {
        runtime::revert(ApiError::User(ERROR_PROPOSAL_NOT_FOUND));
    }
    
    let data = proposal_data.unwrap();
    let parts: Vec<&str> = data.split('_').collect();
    let start_time: u64 = parts[0].parse().unwrap_or(0);
    let end_time: u64 = parts[1].parse().unwrap_or(0);
    
    let current_time: u64 = runtime::get_blocktime().into();
    
    if current_time < start_time {
        runtime::revert(ApiError::User(ERROR_VOTING_NOT_STARTED));
    }
    if current_time > end_time {
        runtime::revert(ApiError::User(ERROR_VOTING_ENDED));
    }
    
    let votes_dict = runtime::get_key(DICT_VOTES).unwrap().into_uref().unwrap();
    let vote_key = format!("{}_{}_{}", dao_id, proposal_id, voter);
    
    if let Ok(Some(_)) = storage::dictionary_get::<bool>(votes_dict, &vote_key) {
        runtime::revert(ApiError::User(ERROR_ALREADY_VOTED));
    }

    let daos_dict = runtime::get_key(DICT_DAOS).unwrap().into_uref().unwrap();
    let token_key: Key = storage::dictionary_get(daos_dict, &dao_id.to_string())
        .unwrap_or_revert()
        .unwrap_or_revert();
    
    let dao_types = runtime::get_key(DICT_DAO_TYPES).unwrap().into_uref().unwrap();
    let token_type_opt: Option<String> = storage::dictionary_get(dao_types, &dao_id.to_string()).unwrap_or_revert();
    let token_type = token_type_opt.unwrap_or("u512_owner".to_string());
    
    let token_hash = match token_key {
        Key::Hash(h) => ContractHash::new(h),
        _ => runtime::revert(ApiError::User(ERROR_INVALID_TOKEN_KEY)),
    };
    
    let token_balance: u64;
    
    if token_type == "u512_owner" {
        let owner: AccountHash = caller;
        let balance: U512 = runtime::call_contract(
            token_hash,
            "balance_of",
            runtime_args! { "owner" => owner },
        );
        if balance == U512::zero() {
            runtime::revert(ApiError::User(ERROR_NO_TOKENS));
        }
        token_balance = balance.as_u64();
    } else if token_type == "u256_address" {
        let balance: U256 = runtime::call_contract(
            token_hash,
            "balance_of",
            runtime_args! { "address" => voter },
        );
        if balance == U256::zero() {
            runtime::revert(ApiError::User(ERROR_NO_TOKENS));
        }
        token_balance = balance.as_u64();
    } else {
        runtime::revert(ApiError::User(ERROR_INVALID_TOKEN_TYPE));
    }
    
    let vote_weight = integer_sqrt(token_balance);
    
    storage::dictionary_put(votes_dict, &vote_key, choice);
    
    let weights_dict = runtime::get_key(DICT_VOTE_WEIGHTS).unwrap().into_uref().unwrap();
    storage::dictionary_put(weights_dict, &vote_key, vote_weight);
    
    let member_key = format!("{}_{}", dao_id, voter);
    let members_dict = runtime::get_key(DICT_DAO_MEMBERS).unwrap().into_uref().unwrap();
    let is_member: Option<bool> = storage::dictionary_get(members_dict, &member_key).unwrap_or_revert();
    
    if is_member.is_none() {
        storage::dictionary_put(members_dict, &member_key, true);
        
        let dao_member_count_key = format!("{}_count", dao_id);
        let current_count: u64 = storage::dictionary_get(members_dict, &dao_member_count_key)
            .unwrap_or_revert()
            .unwrap_or(0);
        storage::dictionary_put(members_dict, &dao_member_count_key, current_count + 1);
    }
    
    let event_key = format!("event_vote_{}_{}_{}", dao_id, proposal_id, voter);
    runtime::put_key(&event_key, storage::new_uref(choice).into());
}

fn integer_sqrt(n: u64) -> u64 {
    if n == 0 {
        return 0;
    }
    if n <= 3 {
        return 1;
    }
    
    let mut left = 1u64;
    let mut right = n / 2;
    let mut result = 1u64;
    
    while left <= right {
        let mid = left + (right - left) / 2;
        let square = mid.saturating_mul(mid);
        
        if square == n {
            return mid;
        } else if square < n {
            result = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    result
}

#[no_mangle]
pub extern "C" fn get_proposal_details() {
    let dao_id: u64 = runtime::get_named_arg("dao_id");
    let proposal_id: u64 = runtime::get_named_arg("proposal_id");
    
    let proposals_dict = runtime::get_key(DICT_PROPOSALS).unwrap().into_uref().unwrap();
    let proposal_key = format!("{}_{}", dao_id, proposal_id);
    
    let proposal_data: Option<String> = storage::dictionary_get(proposals_dict, &proposal_key)
        .unwrap_or_revert();
    
    if proposal_data.is_none() {
        runtime::revert(ApiError::User(ERROR_PROPOSAL_NOT_FOUND));
    }
    runtime::ret(casper_types::CLValue::from_t(proposal_data.unwrap()).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn get_vote_weight() {
    let dao_id: u64 = runtime::get_named_arg("dao_id");
    let proposal_id: u64 = runtime::get_named_arg("proposal_id");
    let voter: Key = runtime::get_named_arg("voter");
    
    let weights_dict = runtime::get_key(DICT_VOTE_WEIGHTS).unwrap().into_uref().unwrap();
    let vote_key = format!("{}_{}_{}", dao_id, proposal_id, voter);
    
    let weight: Option<u64> = storage::dictionary_get(weights_dict, &vote_key)
        .unwrap_or_revert();
    
    runtime::ret(casper_types::CLValue::from_t(weight.unwrap_or(0)).unwrap_or_revert());
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
            Parameter::new("token_type", CLType::String),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());

    entry_points.add_entry_point(EntryPoint::new(
        "create_proposal",
        vec![
            Parameter::new("dao_id", CLType::U64),
            Parameter::new("title", CLType::String),
            Parameter::new("description", CLType::String),
            Parameter::new("voting_duration", CLType::U64),
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

    entry_points.add_entry_point(EntryPoint::new(
        "get_proposal_details",
        vec![
            Parameter::new("dao_id", CLType::U64),
            Parameter::new("proposal_id", CLType::U64),
        ],
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());

    entry_points.add_entry_point(EntryPoint::new(
        "get_vote_weight",
        vec![
            Parameter::new("dao_id", CLType::U64),
            Parameter::new("proposal_id", CLType::U64),
            Parameter::new("voter", CLType::Key),
        ],
        CLType::U64,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());

    let (contract_hash, _version) = storage::new_contract(
        entry_points,
        None,
        Some("casper_dao_v3_package".to_string()),
        Some("casper_dao_v3_access".to_string()),
        None,
    );
    
    runtime::put_key("casper_dao_contract_v3", contract_hash.into());
}