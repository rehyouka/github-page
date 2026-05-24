import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {readdirSync, statSync} from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Vite 8 safe multi-page entries
 */
function computePageEntries() {
    const entries = {};
    const pagesDir = resolve(__dirname, 'src/pages');

    for (const dir of readdirSync(pagesDir)) {
        const fullDir = resolve(pagesDir, dir);
        if (!statSync(fullDir).isDirectory()) continue;

        for (const file of readdirSync(fullDir)) {
            if (!file.endsWith('.html')) continue;

            const name = file.replace('.html', '');
            const key = `${dir}-${name}`;
            entries[key] = resolve(fullDir, file);
        }
    }

    return entries;
}

export default defineConfig({
    root: resolve(__dirname, 'src'),
    publicDir: resolve(__dirname, 'public'),
    build: {
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: computePageEntries(),
        },
    },
    plugins: [
        {
            name: 'logging-startup-homepage',
            configureServer(server) {
                server.httpServer?.once('listening', () => {
                    setTimeout(() => {
                        const url = server.resolvedUrls?.local?.[0];
                        if (!url) return;

                        const entry = new URL('pages/home/index.html', url).href;

                        const bold = '\x1b[1m';
                        const cyan = '\x1b[36m';
                        const reset = '\x1b[0m';

                        const width = 56;
                        const line = '─'.repeat(width);

                        console.log('');
                        console.log(line);
                        console.log(
                            `  ${bold}${cyan}➜  Homepage${reset}  ${bold}${entry}${reset}`
                        );
                        console.log(line);
                        console.log('');
                    }, 100);
                });
            },
        },
    ],
});