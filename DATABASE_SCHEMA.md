# Database Schema - Google Sheets Setup

## Overview
This document describes the Google Sheets structure for the Stamp Card system.

## Setup Instructions

1. Create a new Google Spreadsheet
2. Create the following sheets (tabs) with exact names
3. Add the column headers as the first row of each sheet

## Sheet: Users

Stores all user accounts (customers, staff, admins)

| Column | Type | Description |
|--------|------|-------------|
| userId | String (UUID) | Unique user identifier |
| email | String | User's email address (optional if phone provided) |
| phone | String | User's phone number (optional if email provided) |
| passwordHash | String | Hashed password |
| role | String | User role: "customer", "staff", or "admin" |
| storeId | String | Store ID (null for customers and admins) |
| createdAt | DateTime | Account creation timestamp |

**Headers Row:**
```
userId | email | phone | passwordHash | role | storeId | createdAt
```

## Sheet: Stores

Store information and settings

| Column | Type | Description |
|--------|------|-------------|
| storeId | String (UUID) | Unique store identifier |
| storeName | String | Store name |
| ownerUserId | String | User ID of store owner |
| createdAt | DateTime | Store creation timestamp |
| isActive | Boolean | Whether store is active |

**Headers Row:**
```
storeId | storeName | ownerUserId | createdAt | isActive
```

## Sheet: StampCards

Card configuration per store (template for stamp cards)

| Column | Type | Description |
|--------|------|-------------|
| cardId | String (UUID) | Unique card template identifier |
| storeId | String | Associated store ID |
| cardName | String | Name of the card program |
| stampsRequired | Number | Number of stamps to complete card |
| rewardDescription | String | Description of reward |
| ruleType | String | "visit" or "amount" |
| ruleValue | Number | Minimum purchase amount (if ruleType=amount), or 1 (if visit) |
| createdAt | DateTime | Card creation timestamp |
| isActive | Boolean | Whether card is active |

**Headers Row:**
```
cardId | storeId | cardName | stampsRequired | rewardDescription | ruleType | ruleValue | createdAt | isActive
```

## Sheet: CustomerCards

Individual customer card instances with progress

| Column | Type | Description |
|--------|------|-------------|
| customerCardId | String (UUID) | Unique customer card instance |
| customerId | String | User ID of customer |
| cardId | String | Reference to StampCards template |
| storeId | String | Associated store ID |
| currentStamps | Number | Current number of stamps collected |
| status | String | "active", "completed", or "redeemed" |
| createdAt | DateTime | Card instance creation timestamp |
| completedAt | DateTime | When card was completed (null if not completed) |

**Headers Row:**
```
customerCardId | customerId | cardId | storeId | currentStamps | status | createdAt | completedAt
```

## Sheet: Transactions

History of stamp issuances and redemptions

| Column | Type | Description |
|--------|------|-------------|
| transactionId | String (UUID) | Unique transaction identifier |
| customerCardId | String | Associated customer card |
| customerId | String | Customer user ID |
| storeId | String | Associated store ID |
| staffId | String | Staff user ID who processed transaction |
| type | String | "stamp" or "redemption" |
| purchaseAmount | Number | Purchase amount (for stamp transactions) |
| timestamp | DateTime | Transaction timestamp |

**Headers Row:**
```
transactionId | customerCardId | customerId | storeId | staffId | type | purchaseAmount | timestamp
```

## Sheet: Rewards

Completed cards ready for redemption

| Column | Type | Description |
|--------|------|-------------|
| rewardId | String (UUID) | Unique reward identifier |
| customerCardId | String | Associated completed customer card |
| customerId | String | Customer user ID |
| storeId | String | Associated store ID |
| rewardCode | String | QR code data for redemption |
| status | String | "available" or "redeemed" |
| createdAt | DateTime | Reward creation timestamp |
| redeemedAt | DateTime | When reward was redeemed (null if not redeemed) |

**Headers Row:**
```
rewardId | customerCardId | customerId | storeId | rewardCode | status | createdAt | redeemedAt
```

## Notes

- All ID fields use UUID format (e.g., "550e8400-e29b-41d4-a716-446655440000")
- DateTime fields use ISO 8601 format (e.g., "2024-01-21T14:30:00Z")
- Boolean fields use "TRUE" or "FALSE"
- Null values are represented by empty cells
- First row of each sheet must be the headers (case-sensitive)

## Indexes for Performance

Since Google Sheets doesn't have formal indexes, queries should:
- Filter by leftmost columns when possible
- Use specific row ranges when you know the approximate location
- Cache frequently accessed data in script properties
