# Fix for "Operation not permitted" Error

## The Problem:
Your project is in iCloud Drive (`/Users/.../Library/Mobile Documents/com~apple~CloudDocs/...`), which can cause permission issues. iCloud files may not be fully downloaded or accessible to some applications.

## Solution 1: Copy Project to Local Directory (RECOMMENDED)

**This is the easiest fix - copy your project to a local folder:**

```bash
# Copy the entire project to your home directory
cp -r "/Users/hristiangerov/Library/Mobile Documents/com~apple~CloudDocs/School/diplomen" ~/diplomen-local

# Then work from the local copy
cd ~/diplomen-local/backend
mvn clean install
mvn spring-boot:run
```

## Solution 2: Ensure Files are Downloaded from iCloud

**Check if files are fully synced:**

1. Open Finder
2. Navigate to your project folder
3. Right-click on `backend` folder → **Get Info**
4. If you see "Download Now" or a cloud icon, click to download all files
5. Wait for download to complete
6. Then try running Maven again

## Solution 3: Check File Permissions

```bash
# Check permissions
ls -la "/Users/hristiangerov/Library/Mobile Documents/com~apple~CloudDocs/School/diplomen/backend/pom.xml"

# If needed, make it readable
chmod 644 "/Users/hristiangerov/Library/Mobile Documents/com~apple~CloudDocs/School/diplomen/backend/pom.xml"
```

## Solution 4: Exclude iCloud Folder from Restrictions

**macOS may be blocking access. Try:**

1. Open **System Settings** → **Privacy & Security** → **Full Disk Access**
2. Check if Terminal (or your terminal app) has full disk access
3. If not, add it and restart Terminal

---

## BEST SOLUTION: Copy to Local Directory

I **strongly recommend** copying the project to a local directory (not iCloud) for development:

```bash
# One command to copy everything
cp -r "/Users/hristiangerov/Library/Mobile Documents/com~apple~CloudDocs/School/diplomen" ~/Projects/diplomen

# Then use the local copy
cd ~/Projects/diplomen/backend
mvn clean install
mvn spring-boot:run
```

**Benefits:**
- ✅ No permission issues
- ✅ Faster file access
- ✅ No iCloud sync delays
- ✅ Works reliably with development tools

You can still keep the iCloud version for backup, but develop from the local copy.
