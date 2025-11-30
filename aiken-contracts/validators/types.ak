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
