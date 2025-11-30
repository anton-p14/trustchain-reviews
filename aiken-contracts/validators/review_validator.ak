use aiken/builtin
use aiken/collection/list
use aiken/primitive/bytearray
use cardano/script_context.{ScriptContext}
use cardano/transaction.{InlineDatum, Output, Transaction}

/// Product identifier - can be a hash of product details or SKU
pub type ProductId =
  ByteArray

/// Review rating from 1 to 5 stars
pub type Rating =
  Int

/// Reviewer's public key hash (wallet address)
pub type ReviewerPubKeyHash =
  ByteArray

/// Review datum stored on-chain
pub type ReviewDatum {
  /// Unique product identifier
  product_id: ProductId,
  /// Rating (1-5)
  rating: Rating,
  /// Hash of the review content (stored off-chain or on IPFS)
  review_hash: ByteArray,
  /// Reviewer's wallet public key hash
  reviewer: ReviewerPubKeyHash,
  /// Timestamp of review submission (POSIX time)
  timestamp: Int,
  /// Upvotes count
  upvotes: Int,
  /// Flags count (for spam/inappropriate content)
  flags: Int,
  /// Whether the review has been verified by community
  verified: Bool,
}

/// Actions that can be performed on reviews
pub type ReviewRedeemer {
  /// Submit a new review
  SubmitReview
  /// Upvote an existing review
  UpvoteReview { voter: ByteArray }
  /// Flag a review as spam/inappropriate
  FlagReview { flagger: ByteArray }
  /// Claim reward for verified review
  ClaimReward
}

/// Reward token policy parameters
pub type RewardPolicyParams {
  /// Minimum upvotes required for reward
  min_upvotes: Int,
  /// Maximum flags allowed before review is invalidated
  max_flags: Int,
  /// Reward amount in lovelace
  reward_amount: Int,
}

/// Validator for review submission and management
validator review_validator {
  spend(
    datum_opt: Option<ReviewDatum>,
    redeemer: ReviewRedeemer,
    _own_ref: Data,
    ctx: ScriptContext,
  ) {
    let ScriptContext { transaction: tx, .. } = ctx

    when redeemer is {
      // Submit a new review
      SubmitReview -> {
        expect Some(datum) = datum_opt

        // Validate rating is between 1 and 5
        let valid_rating = datum.rating >= 1 && datum.rating <= 5

        // Ensure review is signed by the reviewer
        let signed_by_reviewer =
          list.has(tx.extra_signatories, datum.reviewer)

        // Initial state checks
        let initial_state =
          datum.upvotes == 0 && datum.flags == 0 && !datum.verified

        // Review hash must not be empty
        let has_review_content = bytearray.length(datum.review_hash) > 0

        // Product ID must not be empty
        let has_product_id = bytearray.length(datum.product_id) > 0

        // Reviewer address must not be empty
        let has_reviewer = bytearray.length(datum.reviewer) > 0

        valid_rating && signed_by_reviewer && initial_state && has_review_content && has_product_id && has_reviewer
      }

      // Upvote a review
      UpvoteReview { voter } -> {
        expect Some(old_datum) = datum_opt

        // Ensure transaction is signed by the voter
        let signed_by_voter = list.has(tx.extra_signatories, voter)

        // Find the continuing output with updated datum
        let has_valid_update =
          list.any(
            tx.outputs,
            fn(output) {
              when output.datum is {
                InlineDatum(data) -> {
                  expect new_datum: ReviewDatum = data
                  // Upvote count should increase by 1
                  let upvote_incremented =
                    new_datum.upvotes == old_datum.upvotes + 1
                  // Other fields should remain unchanged
                  let fields_unchanged =
                    new_datum.product_id == old_datum.product_id && new_datum.rating == old_datum.rating && new_datum.review_hash == old_datum.review_hash && new_datum.reviewer == old_datum.reviewer && new_datum.timestamp == old_datum.timestamp && new_datum.flags == old_datum.flags
                  upvote_incremented && fields_unchanged
                }
                _ -> False
              }
            },
          )

        signed_by_voter && has_valid_update
      }

      // Flag a review
      FlagReview { flagger } -> {
        expect Some(old_datum) = datum_opt

        // Ensure transaction is signed by the flagger
        let signed_by_flagger = list.has(tx.extra_signatories, flagger)

        // Find the continuing output with updated datum
        let has_valid_update =
          list.any(
            tx.outputs,
            fn(output) {
              when output.datum is {
                InlineDatum(data) -> {
                  expect new_datum: ReviewDatum = data
                  // Flag count should increase by 1
                  let flag_incremented = new_datum.flags == old_datum.flags + 1
                  // Other fields should remain unchanged
                  let fields_unchanged =
                    new_datum.product_id == old_datum.product_id && new_datum.rating == old_datum.rating && new_datum.review_hash == old_datum.review_hash && new_datum.reviewer == old_datum.reviewer && new_datum.timestamp == old_datum.timestamp && new_datum.upvotes == old_datum.upvotes
                  flag_incremented && fields_unchanged
                }
                _ -> False
              }
            },
          )

        signed_by_flagger && has_valid_update
      }

      // Claim reward for verified review
      ClaimReward -> {
        expect Some(datum) = datum_opt

        // Reward policy parameters
        let params =
          RewardPolicyParams {
            min_upvotes: 5,
            max_flags: 2,
            reward_amount: 10_000_000,
          }

        // Review must have enough upvotes
        let enough_upvotes = datum.upvotes >= params.min_upvotes

        // Review must not have too many flags
        let not_too_many_flags = datum.flags <= params.max_flags

        // Review must be verified
        let is_verified = datum.verified

        // Ensure reviewer is claiming the reward
        let signed_by_reviewer =
          list.has(tx.extra_signatories, datum.reviewer)

        enough_upvotes && not_too_many_flags && is_verified && signed_by_reviewer
      }
    }
  }

  else(_) {
    fail
  }
}

/// Validate rating is within acceptable range
fn valid_rating(rating: Rating) -> Bool {
  rating >= 1 && rating <= 5
}
