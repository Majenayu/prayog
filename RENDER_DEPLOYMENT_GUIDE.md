# Render Deployment Guide for RentHub

## Prerequisites
- GitHub repository with your RentHub code
- Render account (free tier is available)
- All environment secrets ready (API keys, database URL, etc.)

## Step-by-Step Deployment Instructions

### 1. Prepare Your Repository
Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Web Service on Render

1. **Login to Render**: Go to https://dashboard.render.com
2. **Click "New +"** and select **"Web Service"**

### 3. Fill Out the Form

Based on your attached screenshot, here's how to fill each field:

#### Source Code
- **Repository**: Select `Majenayu/prayog` (or your GitHub repo)
- **Branch**: `main`

#### Basic Configuration
- **Service Type**: **Web Service**
- **Name**: `renthub` (or your preferred name)
- **Region**: **Oregon (US West)** (or closest to your users)
- **Root Directory**: Leave blank (unless your code is in a subfolder)

#### Build & Start Commands
- **Build Command**: 
  ```
  npm install
  ```
- **Start Command**: 
  ```
  npm run start
  ```

#### Instance Type
**For Production**: Select **Starter ($7/month)** or higher
- Provides 512 MB RAM, 0.5 CPU
- Zero downtime deployments
- SSH access
- Better performance

**For Testing**: You can use **Free**
- 512 MB RAM, 0.1 CPU
- Service spins down after inactivity
- May have cold starts

**Recommendation**: Start with **Starter ($7/month)** for reliable performance

### 4. Environment Variables

Click **"Add Environment Variable"** for each of the following:

#### Required Environment Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `DATABASE_URL` | Your Neon/PostgreSQL URL | Full PostgreSQL connection string |
| `NODE_ENV` | `production` | Sets Node environment |
| `SESSION_SECRET` | Generate a random string | Used for session encryption |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | From Cloudinary dashboard |
| `OPENAI_API_KEY` | Your OpenAI API key | For AI features |
| `MONGODB_URI` | Your MongoDB connection string | If using MongoDB |
| `GRAPHHOPPER_API_KEY` | Your GraphHopper API key | For map routing |
| `ADMIN_CONTACT_EMAIL` | Admin email address | For contact information |
| `ADMIN_CONTACT_PHONE` | Admin phone number | For contact information |

**How to Generate SESSION_SECRET**:
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important Notes**:
- Never commit secrets to your repository
- Keep your `.env` file in `.gitignore`
- Double-check all API keys are correct

### 5. Deploy

1. Review all settings
2. Click **"Deploy web service"** at the bottom
3. Wait for deployment to complete (5-10 minutes)

### 6. Post-Deployment Setup

#### Create Admin Account
Once deployed, create the admin user by sending a POST request:

**Using curl**:
```bash
curl -X POST https://your-app-name.onrender.com/api/admin/seed
```

**Using browser**:
Visit `https://your-app-name.onrender.com/api/admin/seed` in your browser

This creates the admin account with:
- Username: `ayusha`
- Password: `ayusha`

#### Run Database Migrations (if needed)
If you're using Drizzle migrations:
```bash
# From Render shell (available in Starter plan and above)
npm run db:push
```

### 7. Access Your Application

Your app will be available at:
```
https://your-app-name.onrender.com
```

Test the following:
1. **Homepage**: Should show User, Industry, and Admin login buttons
2. **User Login**: Test with a user account
3. **Industry Login**: Test with an industry account
4. **Admin Login**: Use `ayusha` / `ayusha`
5. **Map Feature**: Should default to Mysuru, Karnataka (12.335627°N, 76.619692°E)

### 8. Custom Domain (Optional)

To use your own domain:
1. Go to your service settings
2. Click "Custom Domain"
3. Add your domain (e.g., `renthub.yourdomain.com`)
4. Update your DNS records as instructed by Render

## Accessing from Mobile & Other Devices

Your Render app is automatically accessible from:
- ✅ Any mobile phone (Android/iOS)
- ✅ Any computer/laptop
- ✅ Any tablet
- ✅ Any browser (Chrome, Firefox, Safari, Edge)

Simply share the URL: `https://your-app-name.onrender.com`

**QR Code Sharing**: Generate a QR code for your app URL to make mobile access easier.

## Monitoring & Logs

### View Logs
1. Go to your service dashboard on Render
2. Click "Logs" tab
3. View real-time application logs

### Check Service Status
- Green indicator = Service is running
- Red indicator = Service has issues
- Yellow indicator = Service is deploying

### Performance Monitoring
Render provides:
- CPU usage graphs
- Memory usage graphs
- Request metrics
- Error tracking

## Troubleshooting

### Issue: Build Fails
**Solution**: Check your build command and ensure all dependencies are in `package.json`

### Issue: App Crashes on Start
**Solution**: 
1. Check logs for error messages
2. Verify all environment variables are set correctly
3. Ensure `NODE_ENV=production`

### Issue: Database Connection Fails
**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check if your database service (Neon) allows connections from Render's IPs
3. Test database connection manually

### Issue: Free Tier Spins Down
**Solution**: Upgrade to Starter plan ($7/month) for always-on service

### Issue: Environment Variables Not Working
**Solution**:
1. Go to Environment tab in Render dashboard
2. Verify all variables are set
3. Click "Manual Deploy" to redeploy with new variables

### Issue: CORS Errors
**Solution**: The app is configured to handle CORS, but if issues occur:
1. Check your frontend API calls use relative URLs (`/api/...`)
2. Verify your app is served from the same domain

## Updating Your App

When you push code to GitHub:
1. Render **automatically deploys** new changes
2. Zero downtime if using Starter plan or higher
3. Check deployment status in Render dashboard

**Manual Deploy**:
If auto-deploy is disabled:
1. Go to your service dashboard
2. Click "Manual Deploy"
3. Select the branch to deploy

## Cost Breakdown

### Free Plan
- **Cost**: $0
- **Limitations**: Spins down after 15 minutes of inactivity, slower cold starts
- **Best for**: Testing, development

### Starter Plan
- **Cost**: $7/month
- **Benefits**: Always on, faster performance, zero downtime deploys
- **Best for**: Production apps, small businesses

### Higher Plans
- **Standard**: $25/month (2 GB RAM, 1 CPU)
- **Pro**: $85/month (4 GB RAM, 2 CPU)
- Best for high-traffic applications

## Security Best Practices

1. **Never commit `.env` files** to GitHub
2. **Use strong SESSION_SECRET** (minimum 32 characters)
3. **Keep API keys secret** - only add them in Render dashboard
4. **Enable HTTPS** - Render provides free SSL certificates
5. **Rotate secrets regularly** - Update API keys periodically

## Support & Resources

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status Page**: https://status.render.com

## Admin Access Details

After deployment, you can access the admin panel:

**URL**: `https://your-app-name.onrender.com/admin`

**Login Credentials**:
- Username: `ayusha`
- Password: `ayusha`

**Important**: Change these credentials in production by creating a new admin user with a strong password.

## Success Checklist

- [ ] Repository pushed to GitHub
- [ ] Web service created on Render
- [ ] All environment variables configured
- [ ] Build command set correctly
- [ ] Start command set correctly
- [ ] Service deployed successfully
- [ ] Admin account seeded
- [ ] Can access app from browser
- [ ] Can access app from mobile phone
- [ ] User login works
- [ ] Industry login works
- [ ] Admin login works (ayusha/ayusha)
- [ ] Map shows correct default location (Mysuru)
- [ ] All API features working (Cloudinary, OpenAI, etc.)

---

**Congratulations! Your RentHub application is now live and accessible worldwide! 🎉**
