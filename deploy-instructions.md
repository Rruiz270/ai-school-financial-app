# Deployment Instructions for GitHub and Vercel

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository with these settings:
   - Repository name: `ai-school-financial-app`
   - Description: "Financial modeling application for AI School Brazil - K-12 education venture"
   - Keep it Public or Private as you prefer
   - Do NOT initialize with README, .gitignore, or license (we already have these)

## Step 2: Push to GitHub

After creating the repository, run these commands in your terminal:

```bash
cd "/Users/Raphael/Desktop/BP K12/ai-school-financial-app"

# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-school-financial-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your `ai-school-financial-app` repository
5. Vercel will automatically detect it's a Vite project
6. Click "Deploy" - no configuration needed!

### Option B: Using Vercel CLI

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd "/Users/Raphael/Desktop/BP K12/ai-school-financial-app"
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Select your account
   - Link to existing project: No
   - Project name: ai-school-financial-app
   - Directory: ./
   - Build command: (auto-detected)
   - Output directory: (auto-detected)

## Your Application URLs

Once deployed, you'll have:
- **Production URL**: https://ai-school-financial-app.vercel.app
- **Preview URLs**: Created for each git push

## Updating the Application

After deployment, any new commits pushed to GitHub will automatically trigger a new deployment on Vercel:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push
```

## Environment Variables (if needed later)

If you need to add environment variables:
1. Go to your Vercel project dashboard
2. Click on "Settings" → "Environment Variables"
3. Add any required variables

## Custom Domain (Optional)

To add a custom domain:
1. Go to your Vercel project dashboard
2. Click on "Settings" → "Domains"
3. Add your custom domain

## Troubleshooting

- If the build fails, check the build logs in Vercel dashboard
- Make sure all dependencies are listed in package.json
- The app is configured to work with Vite, no special configuration needed