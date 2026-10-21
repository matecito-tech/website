#!/usr/bin/env bun
/**
 * Wrapper de `astro dev` para Astro 7 (que daemoniza el server).
 * Muestra la URL en formato legible y espera.
 */
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const child = spawn('astro', ['dev', ...args], { stdio: ['inherit', 'pipe', 'pipe'] });

let printed = false;
const showUrl = (line) => {
    if (printed) return;
    try {
        const parsed = JSON.parse(line);
        if (parsed.message?.includes('http')) {
            printed = true;
            const url = parsed.message.match(/https?:\/\/[^\s(]+/)?.[0] ?? 'http://localhost:4321';
            console.log(`\n  ✅  Dev server: ${url}`);
            console.log(`  📋  Logs: bun run dev:logs   |  🛑  Stop: bun run dev:stop\n`);
        }
    } catch {
        /* línea no-JSON: se ignora */
    }
};

child.stdout.on('data', (d) => String(d).split('\n').forEach(showUrl));
child.stderr.on('data', (d) => process.stderr.write(d));
child.on('exit', (code) => process.exit(code ?? 0));
