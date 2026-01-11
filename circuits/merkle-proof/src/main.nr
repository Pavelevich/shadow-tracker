// Merkle Proof Verification Circuit
// Proves membership in a set without revealing which element

use dep::std::hash::pedersen_hash;

global TREE_DEPTH: u32 = 10;

// Main circuit: Prove leaf is in Merkle tree with given root
fn main(
    // Private inputs
    leaf: Field,
    path: [Field; 10],
    indices: [u1; 10],

    // Public input
    root: pub Field
) {
    let computed_root = compute_merkle_root(leaf, path, indices);
    assert(computed_root == root);
}

// Compute Merkle root from leaf and path
fn compute_merkle_root(
    leaf: Field,
    path: [Field; 10],
    indices: [u1; 10]
) -> Field {
    let mut current = leaf;

    for i in 0..10 {
        let (left, right) = if indices[i] == 0 {
            (current, path[i])
        } else {
            (path[i], current)
        };
        current = pedersen_hash([left, right]);
    }

    current
}

// Helper: Hash two children to get parent
fn hash_pair(left: Field, right: Field) -> Field {
    pedersen_hash([left, right])
}

#[test]
fn test_single_level() {
    // Simple test with depth 1 equivalent
    let leaf: Field = 100;
    let sibling: Field = 200;

    // If index is 0, leaf is left child
    let root = hash_pair(leaf, sibling);

    // Create path with sibling at index 0, rest zeros
    let mut path: [Field; 10] = [0; 10];
    path[0] = sibling;

    let mut indices: [u1; 10] = [0; 10];
    indices[0] = 0;

    // Manually compute expected root
    let mut expected = leaf;
    expected = hash_pair(expected, sibling);
    for _ in 1..10 {
        expected = hash_pair(expected, 0);
    }

    main(leaf, path, indices, expected);
}
