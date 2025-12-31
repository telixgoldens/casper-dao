#![no_std]
#![no_main]

extern crate alloc;
use alloc::string::{String, ToString};
use alloc::vec;

use casper_contract::{contract_api::{runtime, storage}, unwrap_or_revert::UnwrapOrRevert};
use casper_types::{CLType, Key, Parameter, U256, EntryPointAccess, EntryPointType, EntryPoints, contracts::EntryPoint, CLValue};

#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();

    // balance_of(address: Key) -> U256
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

    // simple installation
    let (contract_hash, _version) = storage::new_contract(
        entry_points,
        None,
        Some("token_wrapper_package".to_string()),
        Some("token_wrapper_access".to_string()),
        None,
    );

    runtime::put_key("token_wrapper_contract", contract_hash.into());
}

#[no_mangle]
pub extern "C" fn init() {
    // For ModuleBytes deploys the runtime expects an `init` export.
    // Delegate to `call()` which installs the contract.
    call();
}

#[no_mangle]
pub extern "C" fn balance_of() {
    // read arg
    let addr: Key = runtime::get_named_arg("address");

    // For testing, return a constant U256 value of 1
    let v: U256 = U256::from(1u64);
    runtime::ret(CLValue::from_t(v).unwrap_or_revert());
}
