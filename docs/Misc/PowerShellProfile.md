# PowerShell Profile - M365 Admin Tools

## Overview

This PowerShell profile automatically loads M365 administration tools and shortcuts when PowerShell starts. It provides quick connection commands, useful functions, and aliases for common Exchange Online, SharePoint, Microsoft Graph, and Teams tasks.

The profile includes pre-built functions for:
- Connecting to M365 services (Exchange, Graph, SPO, Teams, SCC, Azure)
- Email and mailbox management
- Group management and membership checking
- Audit and troubleshooting capabilities
- Calendar loop detection and remediation
- Mobile device management
- Temporary mailbox access control

## Installation

### Step 1: Locate Your Profile

Open PowerShell and check your profile location:

```powershell
$PROFILE
```

This will return something like: `C:\Users\<username>\Documents\PowerShell\profile.ps1`

### Step 2: Create Profile (if it doesn't exist)

```powershell
New-Item -ItemType File -Path $PROFILE -Force
```

### Step 3: Edit Your Profile

Open your profile in your preferred editor:

```powershell
notepad $PROFILE        # Notepad
code $PROFILE           # VS Code
```

### Step 4: Copy and Paste the Script

Copy the complete script from the **"Complete Profile Script"** section below and paste it into your profile file.

### Step 5: Save and Reload

1. Save the file
2. Reload the profile in PowerShell:

```powershell
& $PROFILE
```

You should see the startup message with all available commands.

### Step 6: Prerequisites

Ensure you have the required PowerShell modules installed:

```powershell
# Exchange Online Management
Install-Module -Name ExchangeOnlineManagement -Force

# Microsoft Graph
Install-Module -Name Microsoft.Graph -Force

# SharePoint Online
Install-Module -Name Microsoft.Online.SharePoint.PowerShell -Force

# Microsoft Teams
Install-Module -Name MicrosoftTeams -Force

# Security & Compliance
# Usually installed with ExchangeOnlineManagement

# Azure (optional)
Install-Module -Name Az -Force
```

## Connection Commands

### Exchange Online Only
```powershell
exo
```
Connects to Exchange Online. Optionally specify a UPN:
```powershell
exo user@company.com
```

### SharePoint Online
```powershell
spo <tenant-name>
```
Examples:
```powershell
spo rivcounty
spo rivcounty-admin.sharepoint.com
spo https://rivcounty-admin.sharepoint.com
```

### Security & Compliance Center
```powershell
scc
scc user@company.com
```

### Microsoft Teams
```powershell
teams
```

### Azure
```powershell
azure
```

### Full M365 Connection
Connects to both Exchange Online and Microsoft Graph:
```powershell
m365
m365 user@company.com
```

### Check Connection Status
```powershell
status
```

### Disconnect All Services
```powershell
disco
```

## Quick Commands - Email & Mailbox

### Check Email Address
```powershell
ce john.smith@company.com
```
Returns all recipient objects matching that email pattern, including type, members (if group), and permissions (if shared mailbox).

### Check Mailbox Type
```powershell
cmt shared.mailbox@company.com
```
Shows whether it's a UserMailbox, SharedMailbox, etc.

### Check Mailbox Permissions
```powershell
cmp john.smith@company.com
```
Shows Full Access and Send As permissions on the mailbox.

### Grant Temporary Mailbox Access
```powershell
grant john.smith@company.com
```
Grants yourself Full Access to the mailbox (without auto-mapping). You can then open it in Outlook via "Open another mailbox".

```powershell
grant john.smith@company.com admin@company.com
```
Grant access to a different user.

### Remove Temporary Mailbox Access
```powershell
revoke john.smith@company.com
```

## Quick Commands - Groups

### Check Group Members
```powershell
cgm DPSS-All@company.com
```
Shows all members in a distribution or Microsoft 365 group.

### Add User to Group
```powershell
Add-UserToGroup -User john.smith@company.com -Group "DPSS-All@company.com"
```

## Quick Commands - Audit & Troubleshooting

### Trace Email Delivery
```powershell
te
```
Shows last 20 messages from the last 7 days. Optionally specify sender/recipient:

```powershell
te -Sender john.smith@company.com -Recipient admin@company.com -Days 14
```

### Trace Auto-Replies
```powershell
tar john.smith@company.com
```
Shows automatic reply messages sent by the user in the last 10 days.

### Who Changed This?
```powershell
wc john.smith@company.com
```
Searches audit logs for changes to that object in the last 30 days.

### Check Mobile Devices
```powershell
cmd john.smith@company.com
```
Shows all mobile devices registered to that user's mailbox.

### Fix Calendar Loop
```powershell
fixloop john.smith@company.com
```
Detects calendar response loops and optionally removes mobile devices causing the issue.

## Quick Commands - User Memberships

### Find User Group Memberships
```powershell
fum john.smith@company.com
```
Searches for DPSS distribution groups, M365 groups, and shared mailbox access for the specified user.

## Quick Commands - SharePoint

### Add User to SPO Site Group
```powershell
spouser -SiteUrl https://tenant.sharepoint.com/sites/sitename -User john.smith@company.com -GroupType Members
```

GroupType options: `Admins`, `Owners`, `Members`, `Visitors`

## Startup Display

When you open PowerShell, you'll see:

```
========================================
  M365 ADMIN TOOLS LOADED
========================================

=== M365 CONNECTION STATUS ===

Exchange Online:
  ❌ Not connected

Microsoft Graph:
  ❌ Not connected

Connection commands:
  m365   - Connect to Exchange Online + Graph
  exo    - Connect to Exchange Online only
  spo    - Connect to SharePoint Online
  scc    - Connect to Security & Compliance
  teams  - Connect to Microsoft Teams
  disco  - Disconnect all
  status - Check connection status

Quick commands:
  ce [email]    - Check email address
  cmt [mbx]     - Check mailbox type/resource
  cmp [mbx]     - Check mailbox permissions
  cgm [group]   - Check group members
  te            - Trace email
  tar [user]    - Trace auto-replies
  wc [object]   - Who changed this?
  cmd [user]    - Check mobile devices
  fum [user]    - Find user memberships
  grant [mbx]   - Grant temporary mailbox access
  revoke [mbx]  - Remove temporary mailbox access
  fixloop [user] - Fix calendar loop
  spouser       - Add user to SPO site group
========================================
```

## Troubleshooting

### Profile Won't Run
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Profile Loaded But Commands Not Found
Reload the profile:
```powershell
& $PROFILE
```

### Module Not Found Errors
Install missing modules:
```powershell
Install-Module -Name ModuleName -Force
```

### Connection Errors
Verify you have proper M365 admin credentials and that your account has the necessary permissions in your organization.

## Notes

- The profile automatically displays available commands on startup
- All connection commands require appropriate M365 admin credentials
- Some commands require specific licensing (Teams, SPO, etc.)
- Audit log searches are limited to the last 90 days
- Calendar loop fixes require mailbox management permissions
- SharePoint commands require SPO admin credentials

---

## Complete Profile Script

Copy the entire script below and paste it into your `$PROFILE` file:

```powershell
#==============================================================================
# M365 ADMIN PROFILE - COMPLETE
# Last Updated: 2025-12-05
#==============================================================================

#==============================================================================
# M365 SERVICE CONNECTION FUNCTIONS
#==============================================================================

function Connect-EXO {
    param([string]$UserPrincipalName)
    
    Write-Host "`nConnecting to Exchange Online..." -ForegroundColor Cyan
    
    try {
        if ($UserPrincipalName) {
            Connect-ExchangeOnline -UserPrincipalName $UserPrincipalName -ShowBanner:$false
        } else {
            Connect-ExchangeOnline -ShowBanner:$false
        }
        Write-Host "✅ Connected to Exchange Online" -ForegroundColor Green
        Get-ConnectionInformation | FT UserPrincipalName,ConnectionUri,State -AutoSize
    }
    catch {
        Write-Host "❌ Failed to connect: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Connect-Graph {
    param([string[]]$Scopes = @("User.Read.All", "Group.ReadWrite.All", "Directory.Read.All"))
    
    Write-Host "`nConnecting to Microsoft Graph..." -ForegroundColor Cyan
    
    try {
        Connect-MgGraph -Scopes $Scopes -NoWelcome
        Write-Host "✅ Connected to Microsoft Graph" -ForegroundColor Green
        Get-MgContext | Select-Object Account,Scopes,TenantId
    }
    catch {
        Write-Host "❌ Failed to connect: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Connect-OnPremExchange {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ServerFQDN
    )
    
    Write-Host "`nConnecting to On-Premises Exchange..." -ForegroundColor Cyan
    
    try {
        $Session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri "http://$ServerFQDN/PowerShell/" -Authentication Kerberos
        Import-PSSession $Session -DisableNameChecking -AllowClobber
        Write-Host "✅ Connected to On-Premises Exchange: $ServerFQDN" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to connect: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Connect-M365 {
    param([string]$UserPrincipalName)
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  CONNECTING TO M365 SERVICES" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Connect-EXO -UserPrincipalName $UserPrincipalName
    Connect-Graph
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  CONNECTION COMPLETE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Connect-SCC {
    param([string]$UserPrincipalName)
    
    Write-Host "`nConnecting to Security & Compliance Center..." -ForegroundColor Cyan
    
    try {
        if ($UserPrincipalName) {
            Connect-IPPSSession -UserPrincipalName $UserPrincipalName -ShowBanner:$false
        } else {
            Connect-IPPSSession -ShowBanner:$false
        }
        Write-Host "✅ Connected to Security & Compliance Center" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to connect: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Connect-SPO {
    param(
        [Parameter(Mandatory=$true)]
        [string]$TenantName
    )

    Write-Host "`nConnecting to SharePoint Online..." -ForegroundColor Cyan

    try {
        if (-not (Get-Module -ListAvailable -Name Microsoft.Online.SharePoint.PowerShell)) {
            Write-Host "❌ SharePoint Online Management Shell module not installed" -ForegroundColor Red
            Write-Host "Install with: Install-Module -Name Microsoft.Online.SharePoint.PowerShell" -ForegroundColor Yellow
            return
        }

        # Handle both formats: just tenant name OR full admin URL
        if ($TenantName -match '^https?://') {
            # Full URL provided
            $adminUrl = $TenantName
        } elseif ($TenantName -match '\.sharepoint\.com') {
            # Domain format provided (e.g., rivcounty-admin.sharepoint.com)
            if ($TenantName -notmatch '-admin\.sharepoint\.com$') {
                # If not already admin URL, extract tenant and build admin URL
                $tenant = $TenantName -replace '\.sharepoint\.com.*', ''
                $adminUrl = "https://$tenant-admin.sharepoint.com"
            } else {
                # Already admin URL
                $adminUrl = "https://$TenantName"
            }
        } else {
            # Just tenant name provided (e.g., rivcounty)
            $adminUrl = "https://$TenantName-admin.sharepoint.com"
        }

        Connect-SPOService -Url $adminUrl
        Write-Host "✅ Connected to SharePoint Online: $adminUrl" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to connect: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Connect-Teams {
    Write-Host "`nConnecting to Microsoft Teams..." -ForegroundColor Cyan
    
    try {
        if (-not (Get-Module -ListAvailable -Name MicrosoftTeams)) {
            Write-Host "❌ Microsoft Teams module not installed" -ForegroundColor Red
            Write-Host "Install with: Install-Module -Name MicrosoftTeams" -ForegroundColor Yellow
            return
        }
        
        Connect-MicrosoftTeams
        Write-Host "✅ Connected to Microsoft Teams" -ForegroundColor Green
        
        $tenant = Get-CsTenant -ErrorAction SilentlyContinue
        if ($tenant) {
            Write-Host "Tenant: $($tenant.DisplayName)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ Failed to connect: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Connect-Azure {
    Write-Host "`nConnecting to Azure (Az module)..." -ForegroundColor Cyan
    
    try {
        if (-not (Get-Module -ListAvailable -Name Az.Accounts)) {
            Write-Host "❌ Azure PowerShell (Az) module not installed" -ForegroundColor Red
            Write-Host "Install with: Install-Module -Name Az" -ForegroundColor Yellow
            return
        }
        
        Connect-AzAccount
        Write-Host "✅ Connected to Azure" -ForegroundColor Green
        Get-AzContext | Select-Object Account,Subscription,Tenant
    }
    catch {
        Write-Host "❌ Failed to connect: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Disconnect-M365 {
    Write-Host "`nDisconnecting from all M365 services..." -ForegroundColor Cyan
    
    try { Disconnect-ExchangeOnline -Confirm:$false -ErrorAction SilentlyContinue; Write-Host "✅ Disconnected from Exchange Online" -ForegroundColor Green } catch {}
    try { Disconnect-MgGraph -ErrorAction SilentlyContinue; Write-Host "✅ Disconnected from Microsoft Graph" -ForegroundColor Green } catch {}
    try { Disconnect-IPPSSession -Confirm:$false -ErrorAction SilentlyContinue; Write-Host "✅ Disconnected from Security & Compliance" -ForegroundColor Green } catch {}
    try { Disconnect-SPOService -ErrorAction SilentlyContinue; Write-Host "✅ Disconnected from SharePoint Online" -ForegroundColor Green } catch {}
    try { Disconnect-MicrosoftTeams -ErrorAction SilentlyContinue; Write-Host "✅ Disconnected from Microsoft Teams" -ForegroundColor Green } catch {}
    try { Disconnect-AzAccount -ErrorAction SilentlyContinue; Write-Host "✅ Disconnected from Azure" -ForegroundColor Green } catch {}
    
    Write-Host "`nAll disconnections complete" -ForegroundColor Cyan
}

function Get-M365ConnectionStatus {
    Write-Host "`n=== M365 CONNECTION STATUS ===" -ForegroundColor Cyan
    
    Write-Host "`nExchange Online:" -ForegroundColor Yellow
    $exoConn = Get-ConnectionInformation -ErrorAction SilentlyContinue
    if ($exoConn) {
        Write-Host "  ✅ Connected as: $($exoConn.UserPrincipalName)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Not connected" -ForegroundColor Red
    }
    
    Write-Host "`nMicrosoft Graph:" -ForegroundColor Yellow
    $graphConn = Get-MgContext -ErrorAction SilentlyContinue
    if ($graphConn) {
        Write-Host "  ✅ Connected as: $($graphConn.Account)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Not connected" -ForegroundColor Red
    }
    
    Write-Host ""
}

#==============================================================================
# EMAIL & GROUP MANAGEMENT FUNCTIONS
#==============================================================================

function Get-MailboxType {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Mailbox
    )

    Write-Host "`n=== MAILBOX TYPE FOR: $Mailbox ===" -ForegroundColor Cyan

    Get-Mailbox $Mailbox -ErrorAction SilentlyContinue |
        Select-Object DisplayName,RecipientTypeDetails,ResourceType | Format-List
}

function Check-Email {
    param([string]$Email)

    $r = Get-Recipient -Filter "EmailAddresses -like '*$Email*'" -ErrorAction SilentlyContinue

    if (-not $r) {
        Write-Host "`nNOT FOUND: $Email" -ForegroundColor Red
        return
    }

    Write-Host "`nFOUND: $($r.Count) object(s)" -ForegroundColor Cyan
    $r | ForEach-Object {
        Write-Host "`n$($_.PrimarySmtpAddress)" -ForegroundColor Yellow
        Write-Host "  Type: $($_.RecipientTypeDetails)"
        Write-Host "  Name: $($_.DisplayName)"

        if ($_.RecipientTypeDetails -match "Group") {
            $g = Get-DistributionGroup $_.PrimarySmtpAddress -ErrorAction SilentlyContinue
            if ($g) {
                Write-Host "  Members: $($g.MemberCount)"
            }
        }
        if ($_.RecipientTypeDetails -eq "SharedMailbox") {
            $p = Get-MailboxPermission $_.PrimarySmtpAddress -ErrorAction SilentlyContinue |
                Where-Object {$_.User -notlike "NT*" -and $_.User -notlike "S-1-5-*"}
            if ($p) {
                Write-Host "  Access: $($p.Count) users"
            }
        }
    }

    $base = $Email -replace "@.*"
    $similar = Get-Recipient -Filter "EmailAddresses -like '*$base*'" -ErrorAction SilentlyContinue |
        Where-Object {$_.PrimarySmtpAddress -ne $Email}

    if ($similar) {
        Write-Host "`nSIMILAR ADDRESSES:" -ForegroundColor Cyan
        $similar | ForEach-Object {
            Write-Host "  $($_.PrimarySmtpAddress) - $($_.RecipientTypeDetails)"
        }
    }
}

function Check-MailboxPerms {
    param([string]$Mailbox)
    
    Write-Host "`n=== MAILBOX PERMISSIONS FOR: $Mailbox ===" -ForegroundColor Cyan
    
    Write-Host "`nFull Access:" -ForegroundColor Yellow
    Get-MailboxPermission $Mailbox -ErrorAction SilentlyContinue | 
        Where-Object {$_.User -notlike "NT AUTHORITY*" -and $_.User -notlike "S-1-5-*"} | 
        FT User,AccessRights -AutoSize
    
    Write-Host "Send As:" -ForegroundColor Yellow
    Get-RecipientPermission $Mailbox -ErrorAction SilentlyContinue | 
        Where-Object {$_.Trustee -notlike "NT AUTHORITY*"} | 
        FT Trustee,AccessRights -AutoSize
}

function Check-GroupMembers {
    param([string]$Group)
    
    Write-Host "`n=== MEMBERS OF: $Group ===" -ForegroundColor Cyan
    
    $g = Get-DistributionGroup $Group -ErrorAction SilentlyContinue
    if ($g) {
        Write-Host "Group Type: $($g.RecipientTypeDetails)" -ForegroundColor Yellow
        Write-Host "Member Count: $($g.MemberCount)" -ForegroundColor Yellow
        Write-Host "`nMembers:" -ForegroundColor Yellow
        Get-DistributionGroupMember $Group | FT Name,PrimarySmtpAddress -AutoSize
    } else {
        Write-Host "Group not found" -ForegroundColor Red
    }
}

function Find-UserMemberships {
    param([string]$User)
    
    Write-Host "`n=== FINDING MEMBERSHIPS FOR: $User ===" -ForegroundColor Cyan
    
    $mailbox = Get-Mailbox $User -ErrorAction SilentlyContinue
    if (!$mailbox) {
        Write-Host "User not found" -ForegroundColor Red
        return
    }
    
    Write-Host "`nUser: $($mailbox.DisplayName) ($($mailbox.PrimarySmtpAddress))" -ForegroundColor Yellow
    
    Write-Host "`nDistribution Groups (checking DPSS groups only):" -ForegroundColor Yellow
    $dpssGroups = Get-DistributionGroup "*DPSS*" -ErrorAction SilentlyContinue
    foreach ($group in $dpssGroups) {
        $member = Get-DistributionGroupMember $group.PrimarySmtpAddress -ErrorAction SilentlyContinue | 
            Where-Object {$_.PrimarySmtpAddress -eq $mailbox.PrimarySmtpAddress}
        if ($member) {
            Write-Host "  ✓ $($group.DisplayName) - $($group.PrimarySmtpAddress)" -ForegroundColor Green
        }
    }
    
    Write-Host "`nMicrosoft 365 Groups (DPSS only):" -ForegroundColor Yellow
    $m365Groups = Get-UnifiedGroup "*DPSS*" -ErrorAction SilentlyContinue
    foreach ($group in $m365Groups) {
        $member = Get-UnifiedGroupLinks -Identity $group.PrimarySmtpAddress -LinkType Members -ErrorAction SilentlyContinue | 
            Where-Object {$_.PrimarySmtpAddress -eq $mailbox.PrimarySmtpAddress}
        if ($member) {
            Write-Host "  ✓ $($group.DisplayName) - $($group.PrimarySmtpAddress)" -ForegroundColor Cyan
        }
    }
    
    Write-Host "`nShared Mailbox Access (checking common DPSS mailboxes):" -ForegroundColor Yellow
    $commonMailboxes = @("SSPDS@rivco.org", "APS-CRIS@rivco.org", "DPSS-All@rivco.org")
    foreach ($mbx in $commonMailboxes) {
        $perms = Get-MailboxPermission $mbx -ErrorAction SilentlyContinue | 
            Where-Object {$_.User -like "*$($mailbox.Alias)*"}
        if ($perms) {
            Write-Host "  ✓ $mbx [$($perms.AccessRights -join ',')]" -ForegroundColor Magenta
        }
    }
}

function Trace-Email {
    param(
        [string]$Sender,
        [string]$Recipient,
        [int]$Days = 7
    )

    Write-Host "`n=== MESSAGE TRACE (Last $Days days) ===" -ForegroundColor Cyan

    $params = @{
        StartDate = (Get-Date).AddDays(-$Days)
        EndDate = (Get-Date)
    }

    if ($Sender) { $params.SenderAddress = $Sender }
    if ($Recipient) { $params.RecipientAddress = $Recipient }

    Get-MessageTrace @params |
        Sort-Object Received -Descending |
        Select-Object -First 20 |
        FT Received,SenderAddress,RecipientAddress,Subject,Status -AutoSize
}

function Trace-AutoReply {
    param(
        [Parameter(Mandatory=$true)]
        [string]$User,
        [int]$Days = 10
    )

    Write-Host "`n=== AUTO-REPLIES FROM: $User ===" -ForegroundColor Cyan

    Get-MessageTrace -SenderAddress $User -StartDate (Get-Date).AddDays(-$Days) -EndDate (Get-Date) |
        Where-Object {$_.Subject -like "*Automatic reply*" -or $_.Subject -like "*Out of Office*" -or $_.Subject -like "*Away*"} |
        Sort-Object Received -Descending |
        FT Received,RecipientAddress,Subject,Status -AutoSize
}

function Add-UserToGroup {
    param(
        [Parameter(Mandatory=$true)]
        [string]$User,
        [Parameter(Mandatory=$true)]
        [string]$Group
    )
    
    Add-DistributionGroupMember -Identity $Group -Member $User
    Write-Host "`n✅ Added $User to $Group" -ForegroundColor Green
    
    Write-Host "`nVerifying..." -ForegroundColor Yellow
    Get-DistributionGroupMember $Group | Where-Object {$_.PrimarySmtpAddress -like "*$User*"} | FT Name,PrimarySmtpAddress
}

function Get-WhoChanged {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ObjectId,
        [int]$Days = 30
    )
    
    Write-Host "`n=== AUDIT LOG FOR: $ObjectId ===" -ForegroundColor Cyan
    
    Search-UnifiedAuditLog -StartDate (Get-Date).AddDays(-$Days) -EndDate (Get-Date) -FreeText $ObjectId -RecordType ExchangeAdmin -ResultSize 100 | 
        Select-Object CreationDate,UserIds,Operations | 
        Sort-Object CreationDate -Descending | 
        FT -AutoSize
}

function Check-MobileDevices {
    param([string]$User)
    
    Write-Host "`n=== MOBILE DEVICES FOR: $User ===" -ForegroundColor Cyan
    
    Get-MobileDevice -Mailbox $User -ErrorAction SilentlyContinue | 
        FT FriendlyName,DeviceModel,DeviceOS,FirstSyncTime,LastSuccessSync -AutoSize
}

function Grant-TempAccess {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Mailbox,
        [string]$User = "$env:USERNAME@rivco.org"
    )
    
    Write-Host "`nGranting temporary Full Access to $Mailbox..." -ForegroundColor Cyan
    
    try {
        Add-MailboxPermission -Identity $Mailbox -User $User -AccessRights FullAccess -AutoMapping $false
        Write-Host "✅ Access granted to $User" -ForegroundColor Green
        Write-Host "`nTo access the mailbox:" -ForegroundColor Yellow
        Write-Host "  1. Go to https://outlook.office.com" -ForegroundColor Gray
        Write-Host "  2. Click profile picture > Open another mailbox" -ForegroundColor Gray
        Write-Host "  3. Enter: $Mailbox" -ForegroundColor Gray
        Write-Host "`nRemember to remove access when done:" -ForegroundColor Yellow
        Write-Host "  Remove-TempAccess '$Mailbox'" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Failed to grant access: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Remove-TempAccess {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Mailbox,
        [string]$User = "$env:USERNAME@rivco.org"
    )
    
    Write-Host "`nRemoving temporary Full Access from $Mailbox..." -ForegroundColor Cyan
    
    try {
        Remove-MailboxPermission -Identity $Mailbox -User $User -AccessRights FullAccess -Confirm:$false
        Write-Host "✅ Access removed from $User" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to remove access: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Fix-CalendarLoop {
    param(
        [Parameter(Mandatory=$true)]
        [string]$User
    )
    
    Write-Host "`n=== FIXING CALENDAR LOOP FOR: $User ===" -ForegroundColor Cyan
    
    Write-Host "`nChecking message trace..." -ForegroundColor Yellow
    $messages = Get-MessageTrace -SenderAddress $User -StartDate (Get-Date).AddDays(-7) -EndDate (Get-Date) | 
        Where-Object {$_.Subject -like "*Accepted:*" -or $_.Subject -like "*Tentative:*" -or $_.Subject -like "*Declined:*"}
    
    $grouped = $messages | Group-Object Subject | Sort-Object Count -Descending
    
    if ($grouped) {
        Write-Host "`nFound calendar response loops:" -ForegroundColor Red
        $grouped | Select Count,Name | FT
    }
    
    Write-Host "`nMobile Devices:" -ForegroundColor Yellow
    $devices = Get-MobileDevice -Mailbox $User -ErrorAction SilentlyContinue
    if ($devices) {
        $devices | FT FriendlyName,DeviceModel,LastSuccessSync
        
        $response = Read-Host "`nRemove all mobile devices? (y/n)"
        if ($response -eq 'y') {
            $devices | Remove-MobileDevice -Confirm:$false
            Write-Host "✅ Mobile devices removed. User must re-add email on devices." -ForegroundColor Green
        }
    } else {
        Write-Host "No mobile devices found" -ForegroundColor Gray
    }
    
    Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
    Write-Host "1. If devices removed, have user re-add email on all devices"
    Write-Host "2. Delete the problematic calendar meeting from user's mailbox"
    Write-Host "3. Monitor for 24 hours to ensure loop stopped"
}

function Add-SPOSiteUser {
    param(
        [Parameter(Mandatory=$true)]
        [string]$SiteUrl,
        [Parameter(Mandatory=$true)]
        [string]$User,
        [Parameter(Mandatory=$true)]
        [ValidateSet('Admins','Owners','Members','Visitors')]
        [string]$GroupType
    )

    Write-Host "`n=== ADDING USER TO SPO SITE GROUP ===" -ForegroundColor Cyan
    Write-Host "Site: $SiteUrl" -ForegroundColor Gray
    Write-Host "User: $User" -ForegroundColor Gray
    Write-Host "Group: $GroupType" -ForegroundColor Gray
    Write-Host ""

    try {
        # Check if connected to SPO
        $spoConnection = Get-SPOSite -Limit 1 -ErrorAction SilentlyContinue
        if (-not $spoConnection) {
            Write-Host "❌ Not connected to SharePoint Online" -ForegroundColor Red
            Write-Host "Connect with: spo <tenant-name>" -ForegroundColor Yellow
            return
        }

        # Normalize site URL
        if ($SiteUrl -notmatch '^https?://') {
            Write-Host "❌ Site URL must be a full URL (e.g., https://tenant.sharepoint.com/sites/sitename)" -ForegroundColor Red
            return
        }

        switch ($GroupType) {
            'Admins' {
                Write-Host "Adding as Site Collection Administrator..." -ForegroundColor Yellow
                Set-SPOUser -Site $SiteUrl -LoginName $User -IsSiteCollectionAdmin $true
                Write-Host "✅ $User added as Site Collection Admin" -ForegroundColor Green
            }
            'Owners' {
                Write-Host "Adding to Site Owners group..." -ForegroundColor Yellow
                $site = Get-SPOSite -Identity $SiteUrl
                $groupName = "$($site.Title) Owners"
                try {
                    Add-SPOUser -Site $SiteUrl -LoginName $User -Group $groupName
                    Write-Host "✅ $User added to Owners group" -ForegroundColor Green
                } catch {
                    # Fallback: try generic group name
                    Add-SPOUser -Site $SiteUrl -LoginName $User -Group "Owners"
                    Write-Host "✅ $User added to Owners group" -ForegroundColor Green
                }
            }
            'Members' {
                Write-Host "Adding to Site Members group..." -ForegroundColor Yellow
                $site = Get-SPOSite -Identity $SiteUrl
                $groupName = "$($site.Title) Members"
                try {
                    Add-SPOUser -Site $SiteUrl -LoginName $User -Group $groupName
                    Write-Host "✅ $User added to Members group" -ForegroundColor Green
                } catch {
                    # Fallback: try generic group name
                    Add-SPOUser -Site $SiteUrl -LoginName $User -Group "Members"
                    Write-Host "✅ $User added to Members group" -ForegroundColor Green
                }
            }
            'Visitors' {
                Write-Host "Adding to Site Visitors group..." -ForegroundColor Yellow
                $site = Get-SPOSite -Identity $SiteUrl
                $groupName = "$($site.Title) Visitors"
                try {
                    Add-SPOUser -Site $SiteUrl -LoginName $User -Group $groupName
                    Write-Host "✅ $User added to Visitors group" -ForegroundColor Green
                } catch {
                    # Fallback: try generic group name
                    Add-SPOUser -Site $SiteUrl -LoginName $User -Group "Visitors"
                    Write-Host "✅ $User added to Visitors group" -ForegroundColor Green
                }
            }
        }

        Write-Host "`nVerifying user access..." -ForegroundColor Yellow
        $userInfo = Get-SPOUser -Site $SiteUrl -LoginName $User -ErrorAction SilentlyContinue
        if ($userInfo) {
            Write-Host "Display Name: $($userInfo.DisplayName)" -ForegroundColor Gray
            Write-Host "Login Name: $($userInfo.LoginName)" -ForegroundColor Gray
            Write-Host "Is Site Admin: $($userInfo.IsSiteAdmin)" -ForegroundColor Gray
            if ($userInfo.Groups) {
                Write-Host "Groups: $($userInfo.Groups -join ', ')" -ForegroundColor Gray
            }
        }

    } catch {
        Write-Host "❌ Failed to add user: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
        Write-Host "  - Verify site URL is correct" -ForegroundColor Gray
        Write-Host "  - Verify user email/UPN is correct" -ForegroundColor Gray
        Write-Host "  - Ensure you have permissions to manage this site" -ForegroundColor Gray
        Write-Host "  - For standard sites, use PnP PowerShell for more control" -ForegroundColor Gray
    }
}

#==============================================================================
# ALIASES
#==============================================================================

Set-Alias -Name exo -Value Connect-EXO
Set-Alias -Name m365 -Value Connect-M365
Set-Alias -Name disco -Value Disconnect-M365
Set-Alias -Name status -Value Get-M365ConnectionStatus
Set-Alias -Name spo -Value Connect-SPO
Set-Alias -Name scc -Value Connect-SCC
Set-Alias -Name teams -Value Connect-Teams
Set-Alias -Name azure -Value Connect-Azure
Set-Alias -Name ce -Value Check-Email
Set-Alias -Name cmt -Value Get-MailboxType
Set-Alias -Name cmp -Value Check-MailboxPerms
Set-Alias -Name cgm -Value Check-GroupMembers
Set-Alias -Name te -Value Trace-Email
Set-Alias -Name tar -Value Trace-AutoReply
Set-Alias -Name wc -Value Get-WhoChanged
Set-Alias -Name cmd -Value Check-MobileDevices
Set-Alias -Name fum -Value Find-UserMemberships
Set-Alias -Name fixloop -Value Fix-CalendarLoop
Set-Alias -Name grant -Value Grant-TempAccess
Set-Alias -Name revoke -Value Remove-TempAccess
Set-Alias -Name spouser -Value Add-SPOSiteUser

#==============================================================================
# STARTUP MESSAGE
#==============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  M365 ADMIN TOOLS LOADED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Get-M365ConnectionStatus

Write-Host "Connection commands:" -ForegroundColor Yellow
Write-Host "  m365   - Connect to Exchange Online + Graph" -ForegroundColor Gray
Write-Host "  exo    - Connect to Exchange Online only" -ForegroundColor Gray
Write-Host "  spo    - Connect to SharePoint Online" -ForegroundColor Gray
Write-Host "  scc    - Connect to Security & Compliance" -ForegroundColor Gray
Write-Host "  teams  - Connect to Microsoft Teams" -ForegroundColor Gray
Write-Host "  disco  - Disconnect all" -ForegroundColor Gray
Write-Host "  status - Check connection status" -ForegroundColor Gray

Write-Host ""
Write-Host "Quick commands:" -ForegroundColor Yellow
Write-Host "  ce [email]    - Check email address" -ForegroundColor Gray
Write-Host "  cmt [mbx]     - Check mailbox type/resource" -ForegroundColor Gray
Write-Host "  cmp [mbx]     - Check mailbox permissions" -ForegroundColor Gray
Write-Host "  cgm [group]   - Check group members" -ForegroundColor Gray
Write-Host "  te            - Trace email" -ForegroundColor Gray
Write-Host "  tar [user]    - Trace auto-replies" -ForegroundColor Gray
Write-Host "  wc [object]   - Who changed this?" -ForegroundColor Gray
Write-Host "  cmd [user]    - Check mobile devices" -ForegroundColor Gray
Write-Host "  fum [user]    - Find user memberships" -ForegroundColor Gray
Write-Host "  grant [mbx]   - Grant temporary mailbox access" -ForegroundColor Gray
Write-Host "  revoke [mbx]  - Remove temporary mailbox access" -ForegroundColor Gray
Write-Host "  fixloop [user] - Fix calendar loop" -ForegroundColor Gray
Write-Host "  spouser       - Add user to SPO site group" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
```

---

