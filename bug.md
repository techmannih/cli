# TSCircuit / JLC Search & Import Bug List

This document consolidates the issues captured from the logs into a cleaner, consistent bug-report format.

## Bug 1: JLC search failed for "12MHz crystal"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json "12MHz crystal"' [completed] 1581ms
[tool] output: {
[tool] output:   "query": "12MHz crystal",
[tool] output:   "results": []
[tool] output: }
```

**Bug / Issue:**  
The JLC search completed successfully but returned no results for a very common and expected component query: **"12MHz crystal"**.

**Why it matters:**  
A 12 MHz crystal is a standard requirement for RP2040-based designs. It is used for the main clock source, and almost every reference design includes it. Failure to find such a common component using a basic keyword search indicates weak or unreliable search capability.

**Impact:**  
- Blocks or delays BOM (Bill of Materials) creation  
- Forces users to manually search using exact part numbers or LCSC codes  
- Reduces usability of the search feature for normal workflows  

**Severity:** Medium–High

---

## Bug 2: JLC search failed for "usb c receptacle 16p"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json "usb c receptacle 16p"' [completed] 2216ms
[tool] output: {
[tool] output:   "query": "usb c receptacle 16p",
[tool] output:   "results": []
[tool] output: }
```

**Bug / Issue:**  
The JLC search returned no results for the query **"usb c receptacle 16p"**, which is a common and valid description for a USB Type-C connector.

**Why it matters:**  
USB-C connectors are essential for USB-enabled boards like RP2040 designs. A search system should be able to return relevant results for generic queries such as “USB-C receptacle”.

**Impact:**  
- Makes it difficult to discover connectors using natural language  
- Forces reliance on exact manufacturer part numbers  
- Slows down hardware design workflow  

**Severity:** Medium–High

---

## Bug 3: JLC search failed for exact crystal part number "X322512MSB4SI"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json X322512MSB4SI' [completed] 3188ms
[tool] output: {
[tool] output:   "query": "X322512MSB4SI",
[tool] output:   "results": []
[tool] output: }
```

**Bug / Issue:**  
The JLC search completed successfully but returned no results for the exact part-number query **"X322512MSB4SI"**.

**Why it matters:**  
Exact manufacturer part numbers should be the most reliable search input. If an exact-match lookup returns nothing, it suggests weak indexing or incomplete catalog coverage.

**Impact:**  
- Blocks direct lookup of known parts  
- Slows BOM completion even when the part number is already known  

**Severity:** High

---

## Bug 4: JLC search failed for flash part number "W25Q16JVUXIQ"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json W25Q16JVUXIQ' [completed] 3189ms
[tool] output: {
[tool] output:   "query": "W25Q16JVUXIQ",
[tool] output:   "results": []
[tool] output: }
```

**Bug / Issue:**  
The JLC search returned no results for the flash memory part-number query **"W25Q16JVUXIQ"**.

**Why it matters:**  
External flash is mandatory for RP2040 boards. Failure to find a common flash part by exact identifier makes a core BOM item harder to source.

**Impact:**  
- Blocks or delays RP2040 support-part selection  
- Pushes users toward trial-and-error search terms  
- Reduces trust in exact part-number search behavior  

**Severity:** High

---

## Bug 5: JLC search failed for flash family query "GD25Q16"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json GD25Q16' [completed] 1610ms
[tool] output: {
[tool] output:   "query": "GD25Q16",
[tool] output:   "results": []
[tool] output: }
```

**Bug / Issue:**  
The JLC search returned no results for the flash family query **"GD25Q16"**.

**Why it matters:**  
When an exact flash part is unavailable, a family-level search should normally return closely related options. Returning no results suggests poor discoverability for common flash devices.

**Impact:**  
- Makes alternate flash selection harder  
- Increases manual sourcing effort  
- Slows replacement-part discovery during BOM building  

**Severity:** Medium–High

---

## Bug 6: JLC search failed for "12MHz SMD crystal"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json "12MHz SMD crystal"' [completed] 3351ms
[tool] output: {
[tool] output:   "query": "12MHz SMD crystal",
[tool] output:   "results": []
[tool] output: }
```

**Bug / Issue:**  
The JLC search returned no results for the generic query **"12MHz SMD crystal"**.

**Why it matters:**  
This is a normal descriptive search phrase for a standard timing component. A component search tool should be able to return at least related candidates for such a query.

**Impact:**  
- Makes generic discovery of timing parts unreliable  
- Forces users to already know exact supplier codes  
- Slows design iteration when choosing equivalent parts  

**Severity:** Medium–High

---

## Bug 7: JLC search failed for "12M 3225"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json "12M 3225"' [completed] 3352ms
[tool] output: {
[tool] output:   "query": "12M 3225",
[tool] output:   "results": []
[tool] output: }
```

**Bug / Issue:**  
The JLC search returned no results for the shorthand crystal query **"12M 3225"**.

**Why it matters:**  
This is a practical search style that combines frequency and package size, which is common in electronics sourcing workflows. Failure here suggests the search system does not handle standard shorthand terms well.

**Impact:**  
- Reduces usability for real-world component search habits  
- Makes crystal selection slower  
- Increases dependence on external catalog lookup  

**Severity:** Medium

---

## Bug 8: JLC search failed for "W25Q16"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json W25Q16' [completed] 3553ms
[tool] output: {
[tool] output:   "query": "W25Q16",
[tool] output:   "results": []
[tool] output: }
```

**Bug / Issue:**  
The JLC search returned no results for the generic flash query **"W25Q16"**.

**Why it matters:**  
This is a well-known flash series used in microcontroller boards. A search system should return either direct matches or related variants for such a common family identifier.

**Impact:**  
- Makes it harder to find substitute flash parts  
- Slows BOM development for RP2040 boards  
- Suggests incomplete indexing of common memory devices  

**Severity:** Medium–High

---

## Bug 9: Search result returned empty description metadata for "ME6211C33M5G-N"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json ME6211C33M5G-N' [completed] 3188ms
[tool] output: {
[tool] output:   "query": "ME6211C33M5G-N",
[tool] output:   "results": [
[tool] output:     {
[tool] output:       "source": "jlcpcb",
[tool] output:       "lcsc": 82942,
[tool] output:       "mfr": "ME6211C33M5G-N",
[tool] output:       "package": "SOT-23-5",
[tool] output:       "description": "",
[tool] output:       "stock": 96090,
[tool] output:       "price1": 0.044142857,
[tool] output:       "source_table": "voltage_regulator"
[tool] output:     }
[tool] output:   ]
[tool] output: }
```

**Bug / Issue:**  
The search found the part, but the returned metadata contains an empty **description** field.

**Why it matters:**  
Description text helps confirm part function and avoid incorrect selections, especially when multiple similar parts exist.

**Impact:**  
- Makes part verification harder  
- Increases the risk of selecting the wrong component  

**Severity:** Low–Medium

---

## Bug 10: JLC search failed for generic queries "flash", "button", and "crystal"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json flash' [completed] 1635ms
[tool] output: {
[tool] output:   "query": "flash",
[tool] output:   "results": []
[tool] output: }

[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json button' [completed] 3084ms
[tool] output: {
[tool] output:   "query": "button",
[tool] output:   "results": []
[tool] output: }

[tool] bash /bin/bash -lc 'tsci search --jlcpcb --json crystal' [completed] 3085ms
[tool] output: {
[tool] output:   "query": "crystal",
[tool] output:   "results": []
[tool] output: }
```

**Bug / Issue:**  
The JLC search returned no results for very broad, common component categories: **flash**, **button**, and **crystal**.

**Why it matters:**  
Generic terms should usually return at least some relevant category-level candidates. Empty results here make exploratory part discovery unnecessarily hard.

**Impact:**  
- Weakens category-based search  
- Slows early BOM exploration  
- Forces users to rely on exact identifiers sooner than expected  

**Severity:** Medium

**Note:**  
The `LED` query worked and is therefore not listed as a bug.

---

## Bug 11: JLC import failed for part "C7424716"

**Evidence:**
```log
[tool] bash /bin/bash -lc 'tsci import --jlcpcb C7424716' [failed exit=1] 3359ms
[tool] output: - Searching...
[tool] output: - Importing "C7424716" from JLCPCB...
[tool] output: ✖ Failed to import part
[tool] output: Component not found
```

**Bug / Issue:**  
The JLC import command failed for part **"C7424716"** with **Component not found**.

**Why it matters:**  
Import by explicit catalog or supplier code should be dependable. If the search/import pipeline identifies a usable part elsewhere but import still fails, the workflow becomes inconsistent and hard to trust.

**Impact:**  
- Blocks direct import of a selected part  
- Forces manual fallback modeling  
- Increases time spent working around tooling gaps  

**Severity:** High