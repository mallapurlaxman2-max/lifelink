# 🌐 LifeLink — Community Sharing & Blood Donation Network

> **"Good things are better when shared."**  
> A high-performance, modern React application for local community item borrowing, donations, and neighborhood blood donor discovery.

---

## 🚀 How to Run in VS Code

### Step 1: Open in VS Code
Open the `lifelink` folder in VS Code:
```bash
cd "C:\Users\asus\Downloads\web designer\lifelink"
code .
```

### Step 2: Fix Windows PowerShell Policy (If you see `PSSecurityException`)
On Windows PowerShell, npm scripts might be blocked by default. You can bypass this instantly in your terminal by running:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
*Alternatively, you can always run `npm.cmd` instead of `npm`.*

### Step 3: Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🛠️ Key Fixes & Enhancements Made
1. **Zero-Block Location Handling**:
   - Previously, if GPS access was denied, users were completely blocked from listing an item.
   - Now defaults gracefully to city coordinates (Mysuru) while allowing live GPS distance anytime.
2. **Interactive Direct Message Dialog**:
   - Replaced raw alert/toast with an intuitive request modal to send dates, messages, and contact info to owners.
3. **Comprehensive Blood Donor Network**:
   - Added starter donors for all 8 blood groups (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
   - Added interactive **"Register as Blood Donor"** modal so new donors can join the network.
4. **Local Persistence (`localStorage`)**:
   - Any newly shared items and registered blood donors are saved in browser storage so data persists across refreshes.
5. **Image Error Handling**:
   - Added graceful fallback placeholders if any Unsplash image link fails to load.
6. **Modal UX & Accessibility**:
   - `Escape` key closes modals, and background page scrolling is locked while a modal is open.
   - Clean keyboard focus outlines and ARIA labels.

---

## 🌍 How to Deploy Online (Free in 2 Minutes)

### Option 1: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** → Import your repository (or drag-and-drop the project folder via Vercel CLI).
3. Vercel will automatically detect `vite` and deploy in 30 seconds!

### Option 2: Netlify (Drag & Drop)
1. Run a production build:
   ```bash
   npm run build
   ```
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the generated `dist` folder directly onto the page!
4. Your website is live immediately with an HTTPS URL.

### Option 3: GitHub Pages
1. Push this folder to a GitHub repository.
2. Use GitHub Actions with the official Vite deployment workflow.
