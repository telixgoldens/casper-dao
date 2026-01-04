#![no_std]
#![no_main]

extern crate alloc;
use alloc::string::{String, ToString};
use alloc::vec;

use casper_contract::{contract_api::{runtime, storage}, unwrap_or_revert::UnwrapOrRevert};
use casper_types::{CLType, Key, Parameter, U256, EntryPointAccess, EntryPointType, EntryPoints, contracts::EntryPoint, CLValue, runtime_args, contracts::ContractHash, ApiError};

#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();

    entry_points.add_entry_point(EntryPoint::new(
        "balance_of",
        vec![Parameter::new("address", CLType::Key)],
        CLType::U256,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());

    entry_points.add_entry_point(EntryPoint::new(
        "init",
        vec![],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());

    let (contract_hash, _version) = storage::new_contract(
        entry_points,
        None,
        Some("token_wrapper_package".to_string()),
        Some("token_wrapper_access".to_string()),
        None,
    );

    runtime::put_key("token_wrapper_contract", contract_hash.into());
    runtime::put_key("token_wrapper_real_token", Key::Account(runtime::get_caller()).into());
}

#[no_mangle]
pub extern "C" fn init() {
    call();
}

#[no_mangle]
pub extern "C" fn balance_of() {
    let addr: Key = runtime::get_named_arg("address");

    let token_key_opt = runtime::get_key("token_wrapper_real_token");
    let token_key = token_key_opt.unwrap_or_revert();

    let token_hash = match token_key {
        Key::Hash(h) => ContractHash::new(h),
        _ => runtime::revert(ApiError::User(5)),
    };

    let balance: U256 = runtime::call_contract(
        token_hash,
        "balance_of",
        runtime_args! { "address" => addr },
    );

    runtime::ret(CLValue::from_t(balance).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn set_token() {
    let token: Key = runtime::get_named_arg("token");
    runtime::put_key("token_wrapper_real_token", token.into());
}
