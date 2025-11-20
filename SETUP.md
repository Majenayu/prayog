# RentHub Setup Guide

This guide will help you set up the RentHub application after pulling it from GitHub into Replit.

## Prerequisites

- A Replit account
- The RentHub code imported from GitHub

## Step 1: Import the Project

1. Go to [Replit](https://replit.com)
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Enter the repository URL
5. Click "Import from GitHub"

## Step 2: Configure Environment Secrets

**Important:** The Cloudinary API keys are NOT stored in GitHub for security reasons. You need to add them manually in Replit.

### How to Add Secrets:

1. In your Replit workspace, open the **Tools** panel (left sidebar)
2. Find and click on **Secrets**
3. Add the following three secrets:

| Secret Name | Value |
|-------------|-------|
| `CLOUDINARY_CLOUD_NAME` | `dcd0vatd4` |
| `CLOUDINARY_API_KEY` | (get from team/project owner) |
| `CLOUDINARY_API_SECRET` | (get from team/project owner) |

### Where to Get the Cloudinary Credentials:

- **Option 1:** Ask your team member who has already set up the project
- **Option 2:** Log into the shared Cloudinary account at [cloudinary.com](https://cloudinary.com)
  - Dashboard → Settings → Product Environment Credentials
  - Copy the Cloud Name, API Key, and API Secret

## Step 3: Start the Application

1. The application should start automatically after adding secrets
2. If not, click the **Run** button or restart the workflow
3. The application will be available at the URL shown in the Webview

## Step 4: Verify Everything Works

You should see the RentHub landing page with:
- ✅ No Cloudinary error messages in the console
- ✅ Application running on port 5000
- ✅ Login/Register functionality working

## Troubleshooting

### Error: "CLOUDINARY environment variables are not fully configured"

**Solution:** You forgot to add the secrets. Go back to Step 2 and add all three Cloudinary secrets.

### The application won't start

**Solution:** 
1. Check that all three Cloudinary secrets are added
2. Restart the workflow manually
3. Check the console logs for specific error messages

### Images won't upload

**Solution:** Double-check that your Cloudinary credentials are correct:
- The cloud name should be: `dcd0vatd4`
- Verify API Key and Secret are correct (no extra spaces)

## Important Notes

- ⚠️ **Never commit API keys to GitHub** - Always use Replit Secrets
- ✅ Secrets only need to be configured **once per Replit workspace**
- ✅ After adding secrets, they persist forever in that workspace
- 👥 Share the same Cloudinary credentials with all team members

## Need Help?

If you encounter any issues, contact your team lead or check the application logs in the Replit console.
