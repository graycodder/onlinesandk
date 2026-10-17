# Sash & Knot — Premium Clothing Catalogue & WhatsApp Concierge

A production-ready boutique clothing catalogue and enquiry web application tailored for independent fashion ateliers. Designed with an editorial aesthetic, real-time catalogue browsing, persistent multi-item enquiry bags, and automated click-to-chat WhatsApp integration.

---

## 🌟 Key Features

1. **Editorial Fashion Storefront**
   - Warm luxury colour palette (`#FAF7F2`, `#E8DCCB`, `#292522`, `#8A7869`)
   - High-fashion typography: Cormorant Garamond serif headers and Plus Jakarta Sans body
   - Responsive collections showcase, new arrivals, and featured garment curations

2. **Full Product Catalogue & Details**
   - Real-time search, price range filters, collection filters, and size filters
   - Dedicated product detail pages (`/product/:slug`) with multi-angle photo galleries
   - Dynamic size and colour selectors with custom-measure option
   - Direct WhatsApp enquiry button per dress

3. **Persistent Multi-Item Enquiry Bag**
   - LocalStorage persistence across page refreshes
   - Add multiple distinct dresses with custom sizes and colours
   - Quantity controls, line totals, and estimated enquiry subtotal
   - Safe clear-bag prompt with confirmation safeguard

4. **Reliable WhatsApp Enquiry Workflow**
   - Prepares an organized, URL-encoded WhatsApp message with unique reference IDs (`SK-YYYYMMDD-XXXX`)
   - Customer details validation (name, mobile number, optional city/notes)
   - Opens official `https://wa.me/` endpoint on mobile & desktop
   - Post-launch modal providing copy-to-clipboard fallback and next-step guidance

5. **Authenticated Admin Console (`/admin`)**
   - Secure login via Firebase Authentication (with offline sandbox demo fallback)
   - Real-time statistics: published garments, draft counts, collections, and featured items
   - Complete garment CRUD with image uploads, reordering, and cover image assignment
   - Collection manager with assigned-garment protection checks before deletion
   - Store settings editor (live WhatsApp destination number, hero banner, announcement, socials)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
You can start the application using either command:
```bash
npm run dev
# OR
npm start
```
The server will start at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🔐 Administrator Access

### Sandbox / Demo Mode
When Firebase environment variables are not yet provided, the application runs automatically in offline sandbox mode:
- **Login URL**: `http://localhost:5173/admin/login`
- **Username**: `admin` (or `admin@sashandknot.com`)
- **Password**: `sashandknot2026`

All changes made in demo mode (adding dresses, editing collections, updating WhatsApp numbers) persist in your browser's local sandbox storage.

---

## ☁️ Production Firebase Setup

To connect to your own Firebase project:

1. **Create a Firebase Project**: Visit [Firebase Console](https://console.firebase.google.com/) and create a project.
2. **Enable Authentication**:
   - Go to **Build > Authentication > Sign-in method**.
   - Enable **Email/Password**.
   - In the **Users** tab, add your first administrator user (e.g., `admin@sashandknot.com` with a secure password).
3. **Enable Cloud Firestore**:
   - Go to **Build > Firestore Database > Create Database**.
   - In the **Rules** tab, paste the contents of `firestore.rules`.
   - In Firestore, create an `admins` collection and add a document with your administrator's UID:
     ```json
     {
       "active": true,
       "role": "admin",
       "createdAt": "..."
     }
     ```
4. **Enable Firebase Storage**:
   - Go to **Build > Storage > Get Started**.
   - In the **Rules** tab, paste the contents of `storage.rules`.
5. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in your web app credentials from **Project Settings > General > Your Apps**.
6. **Deploy Security Rules & Hosting**:
   ```bash
   firebase login
   firebase deploy
   ```

---

## 📱 WhatsApp Business Number Configuration

You can update the destination WhatsApp number anytime directly from the admin dashboard:
1. Go to `/admin/settings`.
2. In the **WhatsApp Enquiry Destination** section, enter your international mobile number (e.g. `+91 98765 43210`).
3. Click **Save All Settings**.
4. The website will immediately route all customer enquiry bags to the new number without requiring any code changes or redeployments.
