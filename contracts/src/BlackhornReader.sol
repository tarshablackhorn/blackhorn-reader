// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BlackhornReader (lendable + review/burn rewards)
contract BlackhornReader is ERC1155, Ownable {
    error AlreadyLent();
    error NotLent();
    error LendingActive();
    error Soulbound(); // BASIC badges cannot transfer

    event Lent(address indexed lender, address indexed borrower, uint256 indexed id, uint64 dueAt);
    event Returned(address indexed lender, uint256 indexed id);
    event Recalled(address indexed lender, uint256 indexed id);
    event Reviewed(address indexed user, uint256 indexed id, bytes32 reviewHash);
    event BurnedForRare(address indexed user, uint256 indexed id);

    // --- Single book v1 (extend to multiple later) ---
    uint256 public constant BOOK = 1;

    // Reward badge id spaces (per-book)
    uint256 constant BASIC_BADGE_BASE = 1_000_000;
    uint256 constant RARE_BADGE_BASE  = 2_000_000;
    function basicBadgeId(uint256 bookId) public pure returns (uint256) { return BASIC_BADGE_BASE + bookId; }
    function rareBadgeId(uint256 bookId)  public pure returns (uint256) { return RARE_BADGE_BASE  + bookId; }

    // Lending: bookId => lender => record
    struct Lending { address borrower; uint64 dueAt; }
    mapping(uint256 => mapping(address => Lending)) public lendingOf;
    // Quick borrower access: bookId => borrower => max dueAt
    mapping(uint256 => mapping(address => uint64)) public borrowedUntil;

    // Rewards (per wallet per book): None -> Basic -> Rare
    enum Claim { None, Basic, Rare }
    mapping(uint256 => mapping(address => Claim)) public claimOf;

    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {
        // Mint 1 book to owner (you)
        _mint(msg.sender, BOOK, 1, "");
    }

    // ---------- Lending ----------
    function lend(uint256 bookId, address to, uint64 durationSeconds) external onlyOwner {
        Lending storage L = lendingOf[bookId][msg.sender];
        if (L.borrower != address(0) && block.timestamp < L.dueAt) revert AlreadyLent();
        L.borrower = to;
        L.dueAt    = uint64(block.timestamp) + durationSeconds;
        uint64 due = L.dueAt;
        if (due > borrowedUntil[bookId][to]) borrowedUntil[bookId][to] = due;
        emit Lent(msg.sender, to, bookId, due);
    }

    function returnEarly(uint256 bookId) external {
        Lending storage L = lendingOf[bookId][owner()];
        if (L.borrower != msg.sender || block.timestamp >= L.dueAt) revert NotLent();
        L.borrower = address(0);
        L.dueAt = 0;
        emit Returned(owner(), bookId);
    }

    function recall(uint256 bookId) external onlyOwner {
        Lending storage L = lendingOf[bookId][msg.sender];
        if (L.borrower == address(0)) revert NotLent();
        L.borrower = address(0);
        L.dueAt = 0;
        emit Recalled(msg.sender, bookId);
    }

    function isLent(uint256 bookId, address lender) public view returns (bool) {
        Lending storage L = lendingOf[bookId][lender];
        return L.borrower != address(0) && block.timestamp < L.dueAt;
    }

    // ---------- Review → BASIC (soulbound) ----------
    function reviewAndClaimBasic(uint256 bookId, bytes32 reviewHash) external {
        bool holder = balanceOf(msg.sender, bookId) > 0;
        bool activeBorrow = borrowedUntil[bookId][msg.sender] > block.timestamp;
        require(holder || activeBorrow, "no read access");
        require(claimOf[bookId][msg.sender] == Claim.None, "already claimed");
        _mint(msg.sender, basicBadgeId(bookId), 1, "");
        claimOf[bookId][msg.sender] = Claim.Basic;
        emit Reviewed(msg.sender, bookId, reviewHash);
    }

    // ---------- Burn Book → RARE (upgrade) ----------
    function burnForRare(uint256 bookId) external {
        require(balanceOf(msg.sender, bookId) >= 1, "no book");
        if (isLent(bookId, msg.sender)) revert LendingActive();

        _burn(msg.sender, bookId, 1); // burn book

        if (claimOf[bookId][msg.sender] == Claim.Basic) {
            _burn(msg.sender, basicBadgeId(bookId), 1); // burn BASIC if present
        }
        _mint(msg.sender, rareBadgeId(bookId), 1, "");  // mint RARE
        claimOf[bookId][msg.sender] = Claim.Rare;
        emit BurnedForRare(msg.sender, bookId);
    }

    // ---------- Transfer rules ----------
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal override {
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 id = ids[i];
                // prevent moving the book while an active lend exists
                if (id == BOOK && isLent(BOOK, from)) revert LendingActive();
                // BASIC is soulbound
                if (id == basicBadgeId(BOOK)) revert Soulbound();
            }
        }
        super._update(from, to, ids, amounts);
    }
}
