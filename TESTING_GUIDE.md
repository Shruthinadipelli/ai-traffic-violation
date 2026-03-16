# TrafficEye Authentication & Payment Flow - Testing Guide

## Overview
This guide documents the implemented authentication system, role-based routing, and payment functionality for TrafficEye.

## System Architecture

### Authentication Flow
1. **Landing Page** (`/`) - Public route
   - Shows TrafficEye overview with call-to-action buttons
   - Links to Login/Register pages
   - Displays "VIEW VIOLATIONS DASHBOARD" for quick access to demo data

2. **Login Page** (`/login`)
   - Public route accessible before authentication
   - Select role: Vehicle Owner or Traffic Officer
   - Enter email, password, and vehicle number
   - Creates/retrieves user in localStorage
   - Redirects based on role:
     - Vehicle Owner → `/owner-dashboard`
     - Traffic Officer → `/dashboard`

3. **Register Page** (`/register`)
   - Public route for new user registration
   - Collects: name, email, password, vehicle number, role
   - Validates no duplicate email exists
   - Creates new user in localStorage
   - Redirects to appropriate dashboard

### Role-Based Access Control

#### Vehicle Owner Dashboard (`/owner-dashboard`)
- **Access:** Only users with role `vehicle_owner`
- **Features:**
  - View violations for their vehicle only (filtered by vehicle_number)
  - See violation cards with:
    - Violation type and fine amount
    - Payment status badge (Paid/Unpaid)
    - Camera location and timestamp
    - Speed/limit data (if applicable)
    - Confidence score
  - Payment button for unpaid violations
  - Stats showing:
    - Total violations for their vehicle
    - Unpaid challans count
    - Total outstanding amount
  - Logout functionality

#### Traffic Officer Dashboard (`/dashboard`)
- **Access:** Only users with role `traffic_officer`
- **Features:**
  - View all violations in the system
  - Manage all challans
  - View analytics and reports
  - Process violation reviews
  - Full system access

### Payment System

#### Payment Modal
Triggered when user clicks "Pay Now" on an unpaid violation:

1. **Display Amount:** Shows challan fine amount and due date
2. **Payment Methods:**
   - **UPI:** Shows UPI string format (trafficviolation@hdfc)
   - **Card:** Card details input fields
   - **Bank Transfer:** Direct bank transfer details
3. **Mark as Paid:** Button saves payment in localStorage
   - Updates payment status to "paid"
   - Stores timestamp of payment
   - Generates transaction ID
   - Refreshes page to show updated status

#### Data Storage
- **Users:** Stored in localStorage under key `traffic_eye_user`
- **Payments:** Stored in localStorage under key `traffic_eye_payments`
- **Violations:** Fetched from API (fallback to seed data)

## Testing Scenarios

### Scenario 1: New Vehicle Owner Registration & Payment
1. Go to `/register`
2. Enter details:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
   - Vehicle Number: "MH12AB1234"
   - Role: "Vehicle Owner"
3. Click "Create Account"
4. Should redirect to `/owner-dashboard`
5. Should show 2 violations for MH12AB1234:
   - V-001 (Speeding, ₹1000)
   - V-005 (Speeding, ₹2000)
6. Click "Pay Now" on first violation
7. Select payment method (UPI recommended for demo)
8. Click "Mark as Paid"
9. Page refreshes
10. First violation should show "Paid" badge

### Scenario 2: Traffic Officer Login
1. Go to `/login`
2. Enter details:
   - Email: "officer@example.com"
   - Password: "any_password"
   - Vehicle Number: "ABC123" (any value, not used for officers)
   - Role: "Traffic Officer"
3. Click "Login"
4. Should redirect to `/dashboard`
5. Dashboard should show all 10 violations in the system
6. Should display all management tabs (Overview, Violations, E-Challans, etc.)

### Scenario 3: Session Persistence
1. Register as vehicle owner and login
2. Pay a violation
3. Refresh the page
4. User should remain logged in
5. Paid violation should still show as "Paid"
6. Close browser and open again
7. Go to `/owner-dashboard`
8. User session should be preserved from localStorage

### Scenario 4: Role-Based Routing
1. Register as Vehicle Owner
2. Redirect to `/owner-dashboard` ✓
3. Try to access `/dashboard` manually
4. Should redirect back to `/owner-dashboard` ✓
5. Logout
6. Register as Traffic Officer
7. Redirect to `/dashboard` ✓
8. Try to access `/owner-dashboard` manually
9. Should redirect back to `/dashboard` ✓

### Scenario 5: Protected Routes
1. Visit `/owner-dashboard` without logging in
2. Should redirect to `/login`
3. Visit `/dashboard` without logging in
4. Should redirect to `/login`
5. Public routes `/`, `/login`, `/register` should be accessible

## Key Implementation Files

### Authentication
- `lib/auth.ts` - User storage and retrieval functions
- `lib/types.ts` - Type definitions for User and PaymentRecord
- `hooks/useAuth.ts` - React hook for auth operations
- `components/providers/auth-provider.tsx` - Route protection provider

### Pages
- `app/page.tsx` - Landing page
- `app/login/page.tsx` - Login page with auth logic
- `app/register/page.tsx` - Register page with validation
- `app/owner-dashboard/page.tsx` - Vehicle owner dashboard
- `app/dashboard/page.tsx` - Traffic officer dashboard (existing)

### Components
- `components/owner/payment-modal.tsx` - Payment interface with QR/card/bank options
- `components/providers/auth-provider.tsx` - Role-based routing

### Utilities
- `lib/violation-fines.ts` - Fine amounts and labels
- `lib/payment.ts` - Payment storage and UPI string generation

## Data Flow

### User Registration
```
Register Page → Create User → Save to localStorage → Redirect to Dashboard
```

### Violation Payment
```
Owner Dashboard → Click Pay → Payment Modal Opens
→ Select Method → Mark as Paid → Update localStorage
→ Update payment status → Refresh page
```

### Authentication Check
```
Any Protected Route → Check localStorage → If no user → Redirect to /login
→ If wrong role → Redirect to correct dashboard
```

## Browser DevTools Testing

### Check localStorage:
```javascript
// View current user
console.log(JSON.parse(localStorage.getItem('traffic_eye_user')))

// View payment records
console.log(JSON.parse(localStorage.getItem('traffic_eye_payments')))

// Clear all data
localStorage.clear()
```

## Known Limitations

1. **Authentication:** Demo uses localStorage (no backend validation)
   - Passwords are not validated (any password works)
   - No password hashing
   - For production, implement backend auth with bcrypt

2. **Payments:** Payments are stored in localStorage only
   - No actual payment processing
   - No server-side validation of payments
   - For production, integrate with actual payment gateway (Stripe, Razorpay, etc.)

3. **QR Code:** Generated as UPI string, not actual QR image
   - Can be encoded to QR using QR library (e.g., qrcode.js)
   - Currently shows UPI format string

## Future Enhancements

1. Backend authentication with proper password hashing
2. Real payment gateway integration
3. Email notifications for payment confirmations
4. Payment receipt generation
5. Admin panel for managing violations and users
6. Automated violation detection from cameras
7. SMS/WhatsApp integration for challans
8. Real QR code generation for payments
9. Dispute resolution system
10. Analytics and reporting for traffic patterns
