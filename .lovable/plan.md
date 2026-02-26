

# Plan: Dealer Pagination, Enhanced Dealer Import, and Admin QR Verification

## 1. Add Pagination to Dealer Dashboard Subscription Grid

**File:** `src/pages/DealerDashboard.tsx`

The subscriptions table currently renders all rows without pagination. Will add:
- A `PAGE_SIZE` constant (10 rows per page)
- A `subPage` state variable
- A `PaginationControls` component (reusing the same pattern from AdminDashboard)
- A `paginate()` helper to slice the `filteredSubs` array
- Reset page to 1 when filters change

## 2. Enhance Admin Dealer CSV Import

**File:** `src/pages/AdminDashboard.tsx`

Currently the import only reads `Dealer Code` and `Status` columns, and inserts minimal data. Will update to:

**New CSV template columns** (matching all dealer table fields):
- Dealer Code, Dealer Name, Mobile Number, Email, Channel Type, City, State, Address Line 1, Address Line 2, Pincode, GSTIN, Status

**Template download** will include:
- Header row with all columns above
- 2 sample data rows so users can see expected format and data types

**Import logic** will be updated to:
- Parse all supported columns from the CSV header (flexible matching)
- On insert: populate all available fields (dealer_name, dealer_mobile_number, dealer_email, dealer_city, dealer_state, dealer_address_line1, dealer_address_line2, dealer_pincode, dealer_gstin, dealer_channel_type, dealer_status)
- On update (existing dealer): update all provided fields, not just status
- Continue requiring Dealer Code as mandatory; other fields optional

## 3. Admin QR Code Generation (Already Exists)

The QR Code tab in Admin Dashboard already has full functionality:
- Enter dealer code, verify it against the database
- Generate QR code with registration link
- Copy link to clipboard
- Download branded PDF

No changes needed here -- it is already implemented and functional.

---

## Technical Details

### Files Modified
1. **`src/pages/DealerDashboard.tsx`** -- Add pagination state, paginate helper, and PaginationControls to the subscriptions table
2. **`src/pages/AdminDashboard.tsx`** -- Rewrite `downloadCSVTemplate()` with full headers and sample data; rewrite `handleDealerCSVUpload()` to parse and upsert all dealer fields

### No Database Changes Required
All dealer columns already exist in the `dealers` table.

