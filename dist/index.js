#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const kleur_1 = __importDefault(require("kleur"));
const prompts_1 = __importDefault(require("prompts"));
const TEMPLATES_DIR = path.join(__dirname, "..", "templates");
// ──────────────────────────────────────────────
//  Spinner
// ──────────────────────────────────────────────
const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
function spinner(message) {
    let i = 0;
    const id = setInterval(() => {
        process.stdout.write(`\r  ${kleur_1.default.cyan(FRAMES[i++ % FRAMES.length])} ${message}`);
    }, 80);
    return {
        stop(result) {
            clearInterval(id);
            process.stdout.write(`\r  ${result}\n`);
        },
    };
}
function run(cmd, cwd) {
    (0, node_child_process_1.execSync)(cmd, {
        cwd,
        stdio: "pipe",
        env: { ...process.env, FORCE_COLOR: "0" },
    });
}
// ──────────────────────────────────────────────
//  Main
// ──────────────────────────────────────────────
async function main() {
    console.log();
    console.log(kleur_1.default.bold().cyan("  ⚡ create-prologue"), kleur_1.default.dim("— scaffold a production-grade Playwright project"));
    console.log();
    const response = await (0, prompts_1.default)([
        {
            type: "text",
            name: "projectName",
            message: "Project name",
            initial: "e2e-tests",
            validate: (v) => /^[a-z0-9-]+$/.test(v) ? true : "Use lowercase letters, numbers, and hyphens only",
        },
        {
            type: "text",
            name: "baseUrl",
            message: "Application base URL",
            initial: "http://localhost:3000",
        },
        {
            type: "confirm",
            name: "includeVisual",
            message: "Include visual regression tests?",
            initial: true,
        },
        {
            type: "confirm",
            name: "includeApi",
            message: "Include API helpers for setup/teardown?",
            initial: true,
        },
        {
            type: "confirm",
            name: "includeCi",
            message: "Include GitHub Actions CI/CD?",
            initial: true,
        },
    ], { onCancel: () => process.exit(1) });
    const config = response;
    const targetDir = path.resolve(process.cwd(), config.projectName);
    if (fs.existsSync(targetDir)) {
        console.log(kleur_1.default.red(`\n  ✗ Directory "${config.projectName}" already exists.\n`));
        process.exit(1);
    }
    console.log();
    // ── Step 1: Scaffold files ──
    const s1 = spinner("Scaffolding project structure...");
    try {
        copyDir(TEMPLATES_DIR, targetDir, config);
        const tmplPath = path.join(targetDir, "package.json.tmpl");
        const pkgPath = path.join(targetDir, "package.json");
        if (fs.existsSync(tmplPath)) {
            fs.renameSync(tmplPath, pkgPath);
        }
        if (!config.includeVisual) {
            removeDir(path.join(targetDir, "tests", "visual"));
            removeFile(path.join(targetDir, "src", "utils", "visual.ts"));
        }
        if (!config.includeApi) {
            removeDir(path.join(targetDir, "src", "api"));
        }
        if (!config.includeCi) {
            removeDir(path.join(targetDir, ".github"));
        }
        fs.mkdirSync(path.join(targetDir, "auth"), { recursive: true });
        fs.mkdirSync(path.join(targetDir, "reports"), { recursive: true });
        fs.mkdirSync(path.join(targetDir, "screenshots"), { recursive: true });
        const envExample = path.join(targetDir, ".env.example");
        const envFile = path.join(targetDir, ".env");
        if (fs.existsSync(envExample)) {
            fs.copyFileSync(envExample, envFile);
        }
        const fileCount = countFiles(targetDir);
        s1.stop(kleur_1.default.green(`✓ Scaffolded ${fileCount} files`));
    }
    catch (err) {
        s1.stop(kleur_1.default.red("✗ Scaffold failed"));
        throw err;
    }
    // ── Step 2: npm install ──
    const s2 = spinner("Installing dependencies (npm install)...");
    try {
        run("npm install", targetDir);
        s2.stop(kleur_1.default.green("✓ Dependencies installed"));
    }
    catch (err) {
        s2.stop(kleur_1.default.red("✗ npm install failed"));
        console.log(kleur_1.default.dim("\n  You can retry manually:"));
        console.log(`    cd ${config.projectName}`);
        console.log("    npm install\n");
        throw err;
    }
    // ── Step 3: Playwright browsers ──
    const s3 = spinner("Installing Playwright browsers (this may take a minute)...");
    try {
        run("npx playwright install --with-deps chromium", targetDir);
        s3.stop(kleur_1.default.green("✓ Playwright browsers installed"));
    }
    catch (err) {
        s3.stop(kleur_1.default.yellow("⚠ Playwright install failed (you can retry manually)"));
        console.log(kleur_1.default.dim(`    cd ${config.projectName}`));
        console.log(kleur_1.default.dim("    npx playwright install --with-deps chromium\n"));
    }
    // ── Step 4: Lint check ──
    const s4 = spinner("Verifying code quality (biome check)...");
    try {
        run("npx @biomejs/biome check .", targetDir);
        s4.stop(kleur_1.default.green("✓ All files pass lint & format"));
    }
    catch {
        s4.stop(kleur_1.default.yellow("⚠ Some lint issues found (run npm run lint:fix)"));
    }
    // ── Step 5: Git init ──
    const s5 = spinner("Initializing git repository...");
    try {
        run("git init", targetDir);
        run("git add -A", targetDir);
        run('git commit -m "Initial scaffold via create-prologue"', targetDir);
        s5.stop(kleur_1.default.green("✓ Git repository initialized with first commit"));
    }
    catch {
        s5.stop(kleur_1.default.yellow("⚠ Git init skipped (git not available)"));
    }
    // ── Done ──
    console.log();
    console.log(kleur_1.default.bold().green("  ✓ Project ready!\n"));
    console.log(kleur_1.default.bold("  Get started:\n"));
    console.log(`    cd ${config.projectName}`);
    console.log("    code .                    # open in VS Code");
    console.log("");
    console.log(kleur_1.default.bold("  Run tests:\n"));
    console.log("    npm test                  # all tests");
    console.log("    npm run test:smoke        # smoke tests only");
    console.log("    npm run test:ui           # Playwright UI mode");
    console.log("    npm run test:debug        # step-by-step debugger");
    console.log("");
    console.log(kleur_1.default.bold("  Code quality:\n"));
    console.log("    npm run lint              # check with Biome");
    console.log("    npm run lint:fix          # auto-fix issues");
    console.log("");
    printStructure(config);
}
// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────
function copyDir(src, dest, config) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, config);
        }
        else {
            let content = fs.readFileSync(srcPath, "utf-8");
            content = content.replace(/\{\{projectName\}\}/g, config.projectName);
            content = content.replace(/http:\/\/localhost:3000/g, config.baseUrl);
            fs.writeFileSync(destPath, content);
        }
    }
}
function removeDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true });
    }
}
function removeFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
function countFiles(dir) {
    let count = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules")
            continue;
        if (entry.isDirectory()) {
            count += countFiles(path.join(dir, entry.name));
        }
        else {
            count++;
        }
    }
    return count;
}
function printStructure(config) {
    console.log(kleur_1.default.dim("  Project structure:\n"));
    const lines = [
        "  src/",
        "  ├── core/            Base classes (BasePage, BaseComponent, BaseAPI)",
        "  ├── components/      Reusable UI components (Table, Modal, Form...)",
        "  ├── pages/           Page Objects (one per page)",
        "  ├── fixtures/        Playwright fixture injection",
        config.includeApi ? "  ├── api/             API clients for setup/teardown" : null,
        "  ├── data/            Builders & types for test data",
        "  ├── config/          Environment & user configuration",
        "  ├── reporters/       Custom HTML reporter",
        "  └── utils/           Logger, custom matchers, visual helpers",
        "  tests/",
        "  ├── e2e/             End-to-end specs",
        config.includeVisual ? "  └── visual/          Visual regression specs" : null,
    ].filter(Boolean);
    for (const line of lines) {
        console.log(line);
    }
    console.log();
}
main().catch(console.error);
