import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import crx from 'vite-plugin-crx-mv3'
import * as path from 'path';
import inject from '@rollup/plugin-inject'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      crx({
        manifest: './src/manifest.json',
      }),
      inject({
        $: "jquery",  // 这里会自动载入 node_modules 中的 jquery
        jQuery: "jquery",
        "windows.jQuery": "jquery"
      })
    ],
    build: {
      emptyOutDir: mode == 'production',
      rollupOptions: {
        external: [
          "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css",
          "@chatscope/chat-ui-kit-react",
          "reactflow",
          "reactflow/dist/style.css"
        ],
        input: {
          popup: path.resolve(__dirname, 'popup.html'),
          options: path.resolve(__dirname, 'options.html'),
          chat: path.resolve(__dirname, 'chat.html'),
          edit: path.resolve(__dirname, 'edit.html'),
        }
      }
    },
  }
})
