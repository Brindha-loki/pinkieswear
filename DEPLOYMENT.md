# Netlify Deployment Guide

## Environment Variables

Add the following environment variables in your Netlify dashboard under **Site Settings > Environment Variables**:

### Required Variables
- `NEXT_PUBLIC_INSFORGE_PROJECT_ID` - Your InsForge project ID
- `NEXT_PUBLIC_INSFORGE_API_URL` - Your InsForge API URL
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Your Razorpay key ID
- `INSFORGE_API_KEY` - Your InsForge API key (private)

### Optional Variables
- `NEXT_PUBLIC_SITE_URL` - Your deployed site URL (e.g., https://your-site.netlify.app)

## Deployment Steps

1. **Connect to Netlify**
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository in Netlify dashboard
   - Select the project directory

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 20

3. **Add Environment Variables**
   - Add all the required environment variables listed above
   - Make sure to add them in both "Build" and "Deploy" contexts

4. **Deploy**
   - Netlify will automatically deploy on push
   - Or trigger a manual deploy from the Netlify dashboard

## Notes

- The project uses the `@netlify/plugin-nextjs` plugin for optimal Next.js support
- Static export is configured for better performance
- All API routes and server-side functions are handled by the plugin
- Images and assets are optimized automatically by Next.js

## Troubleshooting

If you encounter build errors:
1. Check that all environment variables are set correctly
2. Ensure Node version 20 is being used
3. Verify that the build command runs successfully locally with `npm run build`
