# Stripe Billing Integration Setup

## Overview
Flowora now supports **Stripe for international customers** (outside India) and **Razorpay for India**. When a user selects a non-India country (US, UK, Singapore, UAE), the checkout automatically switches to Stripe.

## Changes Made

### 1. Frontend Changes
- **Modified**: `src/pages/dashboard/checkout/page.tsx`
  - Added dynamic payment provider selection based on country
  - Stripe redirects to Stripe Checkout hosted page for non-India countries
  - Razorpay continues to work for India
  - Added payment method indicator badge
  
- **Created**: `src/lib/stripe.ts`
  - Client-side Stripe payment processing
  - Handles checkout session creation and redirection

### 2. Backend API Endpoints
- **Created**: `api/stripe/create-checkout-session.ts`
  - Creates Stripe checkout session
  - Manages customer creation/retrieval
  - Returns session ID and client secret
  
- **Created**: `api/stripe/webhook.ts`
  - Handles Stripe webhook events
  - Processes `checkout.session.completed` for subscription activation
  - Handles `customer.subscription.deleted` for cancellation
  - Updates workspace subscription status in Supabase

### 3. Packages Installed
- `stripe` - Server-side payment processing
- `@stripe/stripe-js` - Client-side Stripe integration

## Environment Variables Required

Add these to your `.env.local` and Vercel production environment:

```
# Stripe Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# Stripe Webhook Secret (from https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## Stripe Setup Steps

### 1. Create a Stripe Account
- Go to https://stripe.com
- Sign up and verify your account

### 2. Get API Keys
- Visit https://dashboard.stripe.com/apikeys
- Copy your **Publishable Key** and **Secret Key**
- Add them to your environment variables

### 3. Create Price Objects
You need to create price objects in Stripe Dashboard:

**Go to Products → Create Product:**
- Product Name: "Flowora Pro"
- Price 1: $4.99/month (recurring)
- Price 2: $59.88/year (recurring, billed yearly)

**Copy the Price IDs and update** `api/stripe/create-checkout-session.ts`:
```typescript
const STRIPE_PRICE_IDS: Record<string, string> = {
  monthly: "price_1QqYYgKfz8XXXXXXXXXXXXXN",  // Replace with your monthly price ID
  yearly: "price_1QqYYgKfz8XXXXXXXXXXXXXZ",   // Replace with your yearly price ID
};
```

### 4. Set Up Webhook
- Go to https://dashboard.stripe.com/webhooks
- Add endpoint: `https://yourapp.vercel.app/api/stripe/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.deleted`
- Copy the **Webhook Signing Secret** and add to env vars as `STRIPE_WEBHOOK_SECRET`

### 5. Database Schema
The integration assumes your `workspaces` table has these columns:
```sql
-- Required columns for Stripe
stripe_customer_id TEXT
stripe_subscription_id TEXT
is_pro BOOLEAN
subscription_status TEXT
subscription_plan TEXT
subscription_provider TEXT
pro_activated_at TIMESTAMP
```

If these columns don't exist, run:
```sql
ALTER TABLE workspaces ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE workspaces ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE workspaces ADD COLUMN subscription_provider TEXT;
```

## Country Detection Logic

Countries mapped to Stripe:
- 🇺🇸 United States
- 🇬🇧 United Kingdom
- 🇸🇬 Singapore
- 🇦🇪 United Arab Emirates

All other countries (including India) use Razorpay.

**To add more Stripe countries**, update `src/pages/dashboard/checkout/page.tsx`:
```typescript
const STRIPE_COUNTRIES = ["United States", "United Kingdom", "Singapore", "UAE", "New Country"];
```

## Payment Flow

### Stripe Flow (Non-India):
1. User selects checkout from non-India country
2. Fills in billing details
3. Clicks "Proceed to Pay"
4. Redirected to Stripe Checkout hosted page
5. User completes payment in Stripe Checkout
6. Webhook confirms payment
7. Subscription activated in Supabase
8. User redirected to dashboard

### Razorpay Flow (India):
1. User selects checkout from India
2. Fills in billing details
3. Clicks "Proceed to Pay"
4. Razorpay modal opens
5. User completes payment
6. Payment verified server-side
7. Subscription activated
8. Success modal shown

## Testing

### Local Testing with Stripe
Use Stripe test keys:
1. Get test keys from https://dashboard.stripe.com/apikeys (toggle "Viewing test data")
2. Test card numbers: https://stripe.com/docs/testing

### Test Cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Troubleshooting

### "Stripe is not configured" error
- Ensure `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- Rebuild the app after adding env vars

### Webhook not triggering
- Verify webhook endpoint is publicly accessible
- Check webhook signing secret matches in env vars
- View webhook logs in Stripe Dashboard

### Subscription not activating
- Check Supabase `workspaces` table for `stripe_customer_id`
- Review webhook response in Stripe Dashboard
- Check server logs for webhook handler errors

## Monitoring

### Stripe Dashboard
- View all payments: https://dashboard.stripe.com/payments
- Manage subscriptions: https://dashboard.stripe.com/subscriptions
- View webhooks: https://dashboard.stripe.com/webhooks

### Supabase
- Check `workspaces` table for subscription fields
- Verify `is_pro`, `subscription_status`, `subscription_provider` are being updated

## Future Enhancements

1. **Subscription Management**: Add UI for users to manage Stripe subscriptions
2. **Invoice History**: Display Stripe invoices in dashboard
3. **Tax Calculation**: Implement proper tax handling for different regions
4. **Currency Support**: Add support for multiple currencies in Stripe
5. **Proration**: Handle mid-cycle upgrades/downgrades
