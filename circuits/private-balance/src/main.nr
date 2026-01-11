// Private Balance Verification Circuit
// Proves a user has sufficient balance without revealing actual amount

use dep::std::hash::pedersen_hash;

// Main circuit: Prove balance >= required_amount
fn main(
    // Private inputs (known only to prover)
    actual_balance: Field,
    balance_randomness: Field,

    // Public inputs (visible to everyone)
    balance_commitment: pub Field,
    required_amount: pub Field
) {
    // Step 1: Verify the commitment matches (balance is real)
    let computed_commitment = pedersen_hash([actual_balance, balance_randomness]);
    assert(computed_commitment == balance_commitment);

    // Step 2: Verify sufficient balance
    // Note: This comparison works for Field elements when they represent
    // positive integers within a reasonable range
    assert(actual_balance as u64 >= required_amount as u64);
}

// Test the circuit
#[test]
fn test_valid_balance() {
    let balance: Field = 1000;
    let randomness: Field = 12345;
    let required: Field = 500;

    let commitment = pedersen_hash([balance, randomness]);

    main(balance, randomness, commitment, required);
}

#[test]
fn test_exact_balance() {
    let balance: Field = 500;
    let randomness: Field = 67890;
    let required: Field = 500;

    let commitment = pedersen_hash([balance, randomness]);

    main(balance, randomness, commitment, required);
}
