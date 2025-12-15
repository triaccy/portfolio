import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

export default defineConfig({
  base: '/portfolio/',
  build: {
    rollupOptions: {
      external: ['fsevents']
    }
  },
  plugins: [
    {
      name: 'copy-static-files',
      writeBundle() {
        // Copy all HTML files and directories
        const filesToCopy = [
          'topic.html',
          'project.html',
          'installations',
          'images',
          'wine-bottle-flipbook'
        ]
        
        filesToCopy.forEach(file => {
          const src = join(process.cwd(), file)
          const dest = join(process.cwd(), 'dist', file)
          
          if (existsSync(src)) {
            if (file === 'installations' || file === 'images' || file === 'wine-bottle-flipbook') {
              // Copy directory recursively
              // Create destination directory if it doesn't exist
              if (!existsSync(dest)) {
                mkdirSync(dest, { recursive: true })
              }
              // Use cross-platform copy command - copy contents, not the directory itself
              const isWindows = process.platform === 'win32'
              if (isWindows) {
                execSync(`xcopy /E /I /Y "${src}\\*" "${dest}\\"`, { stdio: 'inherit' })
              } else {
                execSync(`cp -r "${src}/." "${dest}/"`, { stdio: 'inherit' })
              }
            } else {
              copyFileSync(src, dest)
            }
          }
        })
      }
    }
  ]
})
