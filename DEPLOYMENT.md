# GitHub Deployment Guide

This guide will help you deploy your portfolio website to GitHub Pages using GitHub Actions.

## Prerequisites

- A GitHub account
- Git installed on your local machine
- Node.js and npm installed (for local development)

## Setup Instructions

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `portfolio` (or your preferred name)
3. Make it public (required for free GitHub Pages)
4. Don't initialize with README (we already have files)

### 2. Initialize Git and Push Code

```bash
# Navigate to your portfolio directory
cd /Users/tracyzhang/Downloads/portfolio

# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Portfolio website"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git

# Push to GitHub
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically deploy your site

### 4. Configure Repository Settings

Update the following files with your information:

#### package.json
```json
{
  "author": "Your Name",
  "repository": {
    "url": "https://github.com/YOUR_USERNAME/portfolio.git"
  },
  "homepage": "https://YOUR_USERNAME.github.io/portfolio"
}
```

#### vite.config.js
```javascript
export default defineConfig({
  base: '/YOUR_REPO_NAME/',  // Change this to your repository name
  // ... rest of config
})
```

### 5. Custom Domain (Optional)

If you have a custom domain:

1. Create a `CNAME` file in the root directory:
   ```
   yourdomain.com
   ```

2. Add the file to your repository:
   ```bash
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

3. Configure DNS settings with your domain provider

## Local Development

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Deployment Process

The GitHub Actions workflow will:

1. **Trigger** on every push to main branch
2. **Checkout** your code
3. **Setup** Node.js environment
4. **Install** dependencies
5. **Build** the portfolio
6. **Deploy** to GitHub Pages

## Customization

### Update Content
1. Edit `index.html` with your information
2. Modify `styles.css` for design changes
3. Update `script.js` for functionality
4. Commit and push changes:
   ```bash
   git add .
   git commit -m "Update portfolio content"
   git push
   ```

### Add New Features
1. Make your changes
2. Test locally with `npm run dev`
3. Build and test with `npm run build && npm run preview`
4. Commit and push

## Troubleshooting

### Build Fails
- Check the Actions tab in your GitHub repository
- Look for error messages in the workflow logs
- Ensure all dependencies are properly listed in `package.json`

### Site Not Updating
- GitHub Pages can take a few minutes to update
- Check if the workflow completed successfully
- Clear your browser cache

### Custom Domain Issues
- Verify DNS settings with your domain provider
- Ensure the CNAME file is in the root directory
- Check that your domain is properly configured

## Performance Optimization

The build process includes:
- **Minification** of CSS and JavaScript
- **Asset optimization** and compression
- **Source maps** for debugging
- **Tree shaking** to remove unused code

## Security

- All dependencies are locked to specific versions
- Regular security updates via Dependabot
- No sensitive information in the repository

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Review this documentation
3. Check GitHub Pages documentation
4. Open an issue in your repository

---

Your portfolio will be available at: `https://YOUR_USERNAME.github.io/portfolio`
