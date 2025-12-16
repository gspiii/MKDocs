# Certify The Web (CTW) Automated Deployment Guide

This guide explains how to deploy Certify The Web on your server using automated PowerShell scripts.

You can deploy CTW in two ways:

- **Standalone**: Independent certificate management on one server
- **Hub Client**: Centrally managed by Management Hub (recommended for multiple servers)

## Part 1: Prerequisites

Before you start, you need:

- Windows Server 2012 R2 or later
- Administrator PowerShell access (Run as Administrator)
- Network access to Infoblox (ns2mgmt.riverside.ca.us on port 443)
- The deployment files in `C:\CTW\`:
  - Installer executable (see below)
  - Configuration export JSON file
  - Deployment script

### For Hub Client Only

If deploying as a Hub Client, you also need:

- Management Hub already running (e.g., http://zhr-16webt01.rivcoca.org:8080)
- Hub API credentials:
  - **Client ID**: `managedinstance_sp_01`
  - **Client Secret**: (use management Hub Joining key under stored credentials)

## Choose Your Deployment Type

### When to Use Standalone

- ✓ Single server deployment
- ✓ Independent certificate management
- ✓ No need for central management
- ✓ Testing or proof-of-concept

**Files needed:**
- `certifytheweb_standalone_export.json`
- `Deploy-CTW-Standalone.ps1`
- use `certifytheweb_staging_export.json` (for testing on dev servers or workstations)

### When to Use Hub Client

- ✓ Multiple servers (S1, S2, S3, S4)
- ✓ Centralized certificate management
- ✓ Manage all instances from one dashboard
- ✓ Shared configuration and monitoring

**Files needed:**
- `certifytheweb_hub_export.json`
- `Deploy-CTW-HubClient.ps1`

---

## STANDALONE DEPLOYMENT

### Step 1: Run Deployment Script

Run `Deploy-CTW-Standalone.ps1` as admin in PowerShell CLI

**Note**: The file will download and install automatically.

### Step 2: Import Configuration

1. Go to **Settings > Import & Export**
2. Click **"Preview Import..."**
3. Select: `C:\CTW\certifytheweb_standalone_export.json`
4. Enter the configuration password (ask your admin if you don't have it)
5. Click **OK** to complete import

Your certificates and configurations will now appear.

The configuration file (`certifytheweb_standalone_export.json`) contains:

- ✓ Let's Encrypt account configuration
- ✓ Infoblox credentials for DNS validation
- ✓ Stored certificate passwords
- ✓ Any pre-existing certificate configurations

Make sure this file is in: `C:\CTW\certifytheweb_standalone_export.json`

### What the Script Does

**Installing Certify The Web application**
- Creates Windows service

**Importing the Configuration (instant)**
- Imports your settings
- Loads Let's Encrypt account
- Loads Infoblox credentials
- Restores certificate configurations

**Patch Infoblox Script (instant)**
- Fixes SSL certificate validation issues
- Allows DNS challenge responses to work

### Expected Standalone Output

You should see:

```
=== CTW Standalone Deployment ===

[1] Installing CTW...
✓ CTW installed

[2] Applying License...
✓ License applied: ITDGXW33B3

[3] Copying config...
✓ Config copied (includes account info and certificates)

[4] Patching Infoblox...
✓ Infoblox patched

=== Deployment Complete ===
✓ CTW installed
✓ License applied
✓ Config imported (with account info)
✓ Infoblox patched
```

---

## HUB CLIENT DEPLOYMENT (not to use for staging or development)

### Hub Client Step 1: Run Deployment Script

Run `Deploy-CTW-HUB.ps1` as admin in PowerShell CLI

### What the Hub Client Script Does

The script will:

**Downloads and installs latest CTW Hub Client**
- Creates Windows service

**Patch Infoblox Script (instant)**
- Fixes SSL certificate validation issues
- Allows DNS challenge responses to work

### Hub Client Step 2: Import Configuration

1. Go to **Settings > Import & Export**
2. Click **"Preview Import..."**
3. Select: `C:\CTW\certifytheweb_HUB_export.json`
4. Enter the configuration password (ask your admin if you don't have it)
5. Click **OK** to complete import

**Hub client configuration export**
- Contains Infoblox credentials and certificate settings

**Copy Configuration (instant)**
- Imports your settings
- Loads Let's Encrypt account
- Loads Infoblox credentials
- Restores certificate configurations

### Hub Connection Details (ask your admin):

- **Hub API URL**: (e.g., http://zhr-16webt01.rivcoca.org:8080)
- **Client ID**: `managedinstance_sp_01`
- **Client Secret**: (use management hub joining key in stored credentials)

### Expected Hub Client Output

You should see:

```
=== Certify The Web Hub Client Deployment ===

[1] Installing Certify The Web (Hub Client)...
✓ CTW Hub Client installed successfully

[2] Importing configuration...
✓ Configuration file copied

[3] Patching Infoblox DNS plugin...
✓ Infoblox script patched (IBIgnoreCert = $true)

[4] Joining Management Hub...
✓ Hub joining initiated

=== Deployment Complete ===
✓ CTW Hub Client installed
✓ Configuration imported
✓ Infoblox script patched
✓ Hub joining initiated

Hub Details:
  API URL: http://zhr-16webt01.rivcoca.org:8080
  Client ID: managedinstance_sp_01

Verify in Management Hub:
  Management Hub > Instances > Should see this instance listed
```

### After Hub Client Deployment

**Verify Instance in Hub (for Admins):**

1. Open Management Hub: http://zhr-16webt01.rivcoca.org:8080
2. Go to **Certificates > Summary**
3. Look at **Managed Instances** section
4. Your new instance should be listed

**Manage from Hub**

1. Go to **Certificates > New**
2. Select your instance as the **Target Instance**
3. Add domains and request certificates
4. Hub handles everything centrally

**Open Local CTW UI (Optional)**

You can still open the local CTW interface:

1. Press Windows Key
2. Search for: **Certify**
3. Open **"Certify The Web"**

The local UI works alongside Hub management.

---

## Troubleshooting

### "Administrator PowerShell Required"

**Problem**: Script won't run

**Solution**:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Click "Yes" when prompted

### "File Not Found"

**Problem**: Config file missing

**Solution**:
- Verify the file is in `C:\CTW\`
- Check the filename matches exactly
- Get the file from your admin if missing

### "Cannot Connect to Infoblox"

**Problem**: Infoblox DNS validation fails during certificate requests

**Solution**:

1. Verify your server can reach: `ns2mgmt.riverside.ca.us`
2. Open PowerShell and type:
   ```powershell
   Test-NetConnection ns2mgmt.riverside.ca.us -Port 443
   ```
   Should see: `TcpTestSucceeded : True`

If it fails, contact your network team:
> "Please allow outbound access from this server to ns2mgmt.riverside.ca.us:443"

### "Cannot Connect to Hub"

**Problem**: Instance won't join Hub

**Solution**:

1. Verify Hub URL is correct and running
2. Verify Client Secret is correct
3. Test connectivity:
   ```powershell
   Test-NetConnection zhr-16webt01.rivcoca.org -Port 8080
   ```

If it fails, contact your network team:
> "Please allow outbound access from this server to zhr-16webt01.rivcoca.org:8080"

### "Hub Instance Not Appearing"

**Problem**: Instance joined but doesn't show in Hub

**Solution**:
1. Refresh the Hub page (press F5)
2. Wait 30 seconds and refresh again
3. Check Hub logs for errors:
   - **Management Hub > Help > Logs**
4. Verify Client Secret was correct

### "Config Import Fails"

**Problem**: Configuration won't import

**Solution**:
- Make sure you have the configuration password
- Ask your admin if you don't have it
- Verify the JSON file isn't corrupted:
  - Try opening it in Notepad
  - Should contain readable text starting with `{`

### "License Not Applied" (Standalone Only)

**Problem**: License key shows as invalid

**Solution**:
1. Verify the license key is correct: `ITDGXW33B3`
2. If incorrect, contact your admin
3. You can manually apply after:
   - Open Certify The Web
   - Go to **About > Enter License Key**
   - Paste the correct key

---

## Support

For issues or questions:

- Check this guide - Most issues are covered above
- Check PowerShell output - Error messages usually indicate the problem
- Contact your admin - They can help with:
  - Network/firewall issues
  - License key validation
  - Infoblox credential problems
  - Hub connection issues
  - Configuration password

---

## What's Next?

### For Standalone

**Verify installation**
1. Open Certify The Web UI
2. Go to **Managed Certificates** tab
3. Should see your imported certificates

**Test a renewal**
1. Select a certificate
2. Click **"Test"** button
3. Should validate without errors

### For Hub Client

**Verify instance joined**
1. Open Management Hub
2. Go to **Certificates > Summary**
3. Should see your instance listed

**Create a new certificate**
1. Click **Certificates > New**
2. Select your instance as **Target Instance**
3. Add domain and request certificate
4. Hub handles everything

---

## Common Questions

**Q: Do I need to restart after deployment?**
A: Not required, but a restart is safe if desired.

**Q: Will my existing certificates be affected?**
A: No. The configuration import restores previous settings without making changes.

**Q: Can I run the script multiple times?**
A: Yes, it's safe to run again. Re-running won't cause issues.

**Q: What if the script fails halfway?**
A: You can run it again. It will complete the remaining steps.

**Q: Can I switch from Standalone to Hub later?**
A: Yes. Uninstall standalone and deploy as Hub Client. Your config exports can be reused.

**Q: What's the difference between Standalone and Hub?**

| Feature | Standalone | Hub Client |
|---------|-----------|-----------|
| Single Server | ✓ | ✓ |
| Multiple Servers | ✗ | ✓ |
| Central Dashboard | ✗ | ✓ |
| Manage Remotely | ✗ | ✓ |
| Requires Hub | ✗ | ✓ |

---

## Additional Resources

- **CTW Documentation**: https://docs.certifytheweb.com
- **Let's Encrypt**: https://letsencrypt.org
- **Infoblox API**: Contact your Infoblox administrator
- **Management Hub**: Contact your administrator for Hub URL

---

**Deployment Version**: 2.0
**Supports**: Standalone + Hub Client
**Created**: December 2025
**For Support**: Contact your IT Administrator
