import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

export default defineConfig({
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
          'installations'
        ]
        
        filesToCopy.forEach(file => {
          const src = join(process.cwd(), file)
          const dest = join(process.cwd(), 'dist', file)
          
          if (existsSync(src)) {
            if (file === 'installations') {
              // Copy directory recursively
              const { execSync } = require('child_process')
              execSync(`cp -r ${src} ${dest}`)
            } else {
              copyFileSync(src, dest)
            }
          }
        })
      }
    }
  ]
})
