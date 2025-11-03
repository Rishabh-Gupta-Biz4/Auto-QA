#!/usr/bin/env node

/**
 * Lint-staged script that runs: prettier check -> prettier fix -> eslint check -> eslint fix
 * Then verifies everything passes at the end
 * 
 * Lint-staged passes file paths as command line arguments
 */

const { execSync } = require("child_process");
const path = require("path");

// Get files from lint-staged (passed as command line args)
// lint-staged passes files as: node script.js file1 file2 file3
const files = process.argv.slice(2);

if (files.length === 0) {
  console.log("No files to process");
  process.exit(0);
}

// Separate files by type
const jsFiles = files.filter((file) => {
  const ext = path.extname(file).slice(1).toLowerCase();
  return ["ts", "tsx", "js", "jsx"].includes(ext);
});

const otherFiles = files.filter((file) => {
  const ext = path.extname(file).slice(1).toLowerCase();
  return ["json", "scss", "css", "md"].includes(ext);
});

let hasErrors = false;

/**
 * Run a command with proper error handling
 * @param {string[]} args - Command arguments array [cmd, arg1, arg2, ...]
 * @param {string} description - Description for logging
 * @param {boolean} ignoreErrors - If true, don't mark as error (for initial checks)
 */
function runCommand(args, description, ignoreErrors = false) {
  try {
    // Properly quote file paths to handle spaces
    // First argument is the command, rest are arguments (including file paths)
    const command = args[0];
    const fileArgs = args.slice(1).map((arg) => {
      // Quote paths that might contain spaces
      if (arg.includes(" ") && !arg.startsWith('"') && !arg.startsWith("'")) {
        return `"${arg}"`;
      }
      return arg;
    });
    
    const fullCommand = [command, ...fileArgs].join(" ");
    
    execSync(fullCommand, { 
      stdio: "inherit",
      shell: true,
      env: process.env
    });
    return true;
  } catch (error) {
    if (!ignoreErrors) {
      hasErrors = true;
    }
    return false;
  }
}

// Process JS/TS files: prettier check -> prettier fix -> eslint check -> eslint fix -> final checks
if (jsFiles.length > 0) {
  console.log(`\n📝 Processing ${jsFiles.length} JS/TS file(s)...`);
  
  const fileList = jsFiles.join(" ");
  
  // 1. Prettier check (initial check - may fail, we'll fix it)
  console.log("🔍 Step 1/6: Running prettier check...");
  runCommand(["npx", "prettier", "--check", ...jsFiles], "Prettier check", true);
  
  // 2. Prettier fix (auto-fix formatting issues)
  console.log("🔧 Step 2/6: Running prettier fix...");
  runCommand(["npx", "prettier", "--write", ...jsFiles], "Prettier fix", false);
  
  // 3. Prettier check again (verify fix worked)
  console.log("🔍 Step 3/6: Running prettier check after fix...");
  const prettierPassed = runCommand(["npx", "prettier", "--check", ...jsFiles], "Prettier check after fix", false);
  
  // 4. ESLint check (initial check - may fail, we'll fix it)
  console.log("🔍 Step 4/6: Running eslint check...");
  runCommand(["npx", "eslint", ...jsFiles], "ESLint check", true);
  
  // 5. ESLint fix (auto-fix linting issues)
  console.log("🔧 Step 5/6: Running eslint fix...");
  runCommand(["npx", "eslint", "--fix", ...jsFiles], "ESLint fix", false);
  
  // 6. ESLint check again (verify fix worked - must pass)
  console.log("🔍 Step 6/6: Running eslint check after fix...");
  const eslintPassed = runCommand(["npx", "eslint", ...jsFiles], "ESLint check after fix", false);
  
  if (!prettierPassed || !eslintPassed) {
    hasErrors = true;
  }
}

// Process other files (JSON, CSS, SCSS, MD): prettier check -> prettier fix -> verify
if (otherFiles.length > 0) {
  console.log(`\n📝 Processing ${otherFiles.length} other file(s)...`);
  
  // 1. Prettier check (initial check - may fail, we'll fix it)
  console.log("🔍 Step 1/3: Running prettier check...");
  runCommand(["npx", "prettier", "--check", ...otherFiles], "Prettier check", true);
  
  // 2. Prettier fix (auto-fix formatting issues)
  console.log("🔧 Step 2/3: Running prettier fix...");
  runCommand(["npx", "prettier", "--write", ...otherFiles], "Prettier fix", false);
  
  // 3. Prettier check again (verify fix worked - must pass)
  console.log("🔍 Step 3/3: Running prettier check after fix...");
  const prettierPassed = runCommand(["npx", "prettier", "--check", ...otherFiles], "Prettier check after fix", false);
  
  if (!prettierPassed) {
    hasErrors = true;
  }
}

// Final result
if (hasErrors) {
  console.error("\n❌ ❌ ❌ Some checks failed after fixes. Commit blocked. ❌ ❌ ❌");
  console.error("Please fix the errors manually and try committing again.");
  process.exit(1);
}

console.log("\n✅ ✅ ✅ All checks passed! Proceeding with commit... ✅ ✅ ✅");
process.exit(0);

