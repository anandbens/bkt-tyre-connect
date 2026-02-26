

# Customer Portal - Complete Implementation Plan

## Current State
- **CustomerLogin.tsx** -- exists and works (OTP-based, demo code 1234)
- **CustomerLayout.tsx** -- exists with sidebar/bottom nav for 5 menu items
- **ProfilePage.tsx** -- exists and functional (editable profile with state/city selects)
- **MembershipPage.tsx** -- exists and functional (shows subscription cards)
- **Missing**: ReferralPage, ComplaintsPage, TransactionsPage
- **Missing**: Routes in App.tsx for `/customer-login` and `/customer/*`

## What Will Be Built

### 1. Add Routes to App.tsx
- Add `/customer-login` route pointing to `CustomerLogin`
- Add `/customer` layout route with nested child routes:
  - `/customer/dashboard` -- ProfilePage
  - `/customer/membership` -- MembershipPage
  - `/customer/referral` -- ReferralPage (new)
  - `/customer/complaints` -- ComplaintsPage (new)
  - `/customer/transactions` -- TransactionsPage (new)
- Add "Customer Login" link to AppHeader nav items

### 2. Create ReferralPage (`src/pages/customer/ReferralPage.tsx`)
Based on the reference screenshot:
- **Share Your Referral Code section**: Display the customer's unique referral code (customer_code), with copy-to-clipboard and share buttons (WhatsApp, Email, etc.)
- **Helpline info**: "For immediate help, call our 24/7 helpline: 01147090909"
- **Your Referral Data widget**: Stats cards showing total referrals, successful conversions, pending referrals
- **Referral Records table**: Grid showing referred customers with columns (Name, Mobile, Date, Status) -- populated with demo data since referral tracking by customer isn't in the current schema

### 3. Create ComplaintsPage (`src/pages/customer/ComplaintsPage.tsx`)
Based on the reference screenshot:
- **Header section** with support helpline info and two action buttons: "Raise Complaint" and "Write a Review"
- **Complaints table** with columns: Action, Complaint No, Closed Date, Vehicle Number, Service City, Fault Type, Status, Service Status
- **Raise Complaint dialog**: A form to submit new complaints with fields:
  - Vehicle Number (pre-filled from session)
  - Fault Type (dropdown: Flat Tyre, Empty Tank, Battery Issue, Key Lock, Accident, Other)
  - Service City
  - Description (textarea)
- Fetches complaints from the `complaints` table filtered by `customer_mobile`
- Inserts new complaints with auto-generated complaint_number via DB trigger

### 4. Create TransactionsPage (`src/pages/customer/TransactionsPage.tsx`)
- Fetches all subscriptions for the customer from the `subscriptions` table
- Displays a table with columns: Order ID, Plan Name, Amount, Payment Status, Transaction ID, Date
- Shows both successful and pending transactions

### 5. Update ProfilePage
- Add missing fields from reference screenshot: Blood Group, Gender, Father's Name, Address Line 1, Address Line 2, Pin Code
- Note: These fields don't exist in the `customers` DB table, so they will be display-only placeholders for the demo

### 6. Add "Customer Login" to AppHeader
- Add a nav link to `/customer-login` in the header navigation

---

## Technical Details

### Database
- No new migrations needed -- the `complaints` table already exists with the right schema (complaint_number auto-generated, customer_code, customer_mobile, fault_type, vehicle_number, service_city, status, service_status, description, closed_at)
- RLS policies already allow public insert/select/update on complaints

### Files to Create
1. `src/pages/customer/ReferralPage.tsx`
2. `src/pages/customer/ComplaintsPage.tsx`
3. `src/pages/customer/TransactionsPage.tsx`

### Files to Modify
1. `src/App.tsx` -- add customer routes
2. `src/components/AppHeader.tsx` -- add Customer Login nav link
3. `src/pages/customer/ProfilePage.tsx` -- add extra fields from reference

### Key Patterns Followed
- All pages use `useOutletContext<CustomerSession>()` for session data
- All DB queries use the existing `supabase` client
- Complaint creation uses the existing `complaints` table with auto-generated complaint_number
- Demo-friendly: referral data uses sample/mock data since no customer-to-customer referral tracking exists in the schema

