# Deployment Guide

## Current Deployment

**Live Site:** https://jpumj6s9.insforge.site

## Environment Variables

### Required Variables
- `NEXT_PUBLIC_INSFORGE_URL=https://jpumj6s9.us-east.insforge.app`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY=anon_2ba373e6ac8a28476bd8fe943c07d58f5fbb7f83420da2a2d18e563f52bf9cc6`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TEZT6Sag2SzESb`

### Optional Variables
- `NEXT_PUBLIC_SITE_URL=https://jpumj6s9.insforge.site`

## Authentication Issue - RESOLVED

**Root Cause:** The InsForge deployment had no environment variables configured. The production build was not able to access the InsForge backend because the environment variables were only set locally in `.env.local`.

**Fix Applied:**
1. Set environment variables in InsForge deployment:
   - `NEXT_PUBLIC_INSFORGE_URL=https://jpumj6s9.us-east.insforge.app`
   - `NEXT_PUBLIC_INSFORGE_ANON_KEY=anon_2ba373e6ac8a28476bd8fe943c07d58f5fbb7f83420da2a2d18e563f52bf9cc6`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TEZT6Sag2SzESb`

2. Redeployed the application with the new environment variables

**Status:**
- ✅ Website deployed successfully
- ✅ Environment variables configured in deployment
- ✅ Application redeployed with correct configuration
- ✅ Live at: https://jpumj6s9.insforge.site

**To manage deployment environment variables:**
```bash
npx @insforge/cli deployments env list
npx @insforge/cli deployments env set <key> <value>
npx @insforge/cli deployments env delete <id>
```

## Deployment to InsForge

The project is currently deployed to InsForge using:
```bash
npx @insforge/cli deployments deploy
```

## Alternative: Netlify Deployment

If you prefer Netlify deployment:

1. **Connect to Netlify**
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository in Netlify dashboard

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 20

3. **Add Environment Variables**
   - Add the required environment variables listed above
   - Add them in both "Build" and "Deploy" contexts

4. **Deploy**
   - Netlify will automatically deploy on push
