#!/usr/bin/env python3
"""
Unpacks COMPLETE_SOURCE_CODE.txt into the exact folder and file structure.
Usage:
    python3 unpack.py [COMPLETE_SOURCE_CODE.txt]
"""

import sys
import os
import re

def unpack(source_file="COMPLETE_SOURCE_CODE.txt"):
    if not os.path.exists(source_file):
        print(f"Error: {source_file} not found.")
        sys.exit(1)

    pattern = re.compile(r'^===== FILE: (.+?) =====\r?$', re.MULTILINE)
    with open(source_file, "r", encoding="utf-8") as f:
        content = f.read()

    matches = list(pattern.finditer(content))
    if not matches:
        print("No file markers found.")
        return

    print(f"Found {len(matches)} files to unpack.")
    for i, match in enumerate(matches):
        file_path = match.group(1).strip()
        start_idx = match.end()
        end_idx = matches[i + 1].start() if i + 1 < len(matches) else len(content)

        file_content = content[start_idx:end_idx]
        if file_content.startswith('\n'):
            file_content = file_content[1:]
        if file_content.endswith('\n\n'):
            file_content = file_content[:-1]

        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path) if os.path.dirname(file_path) else '.', exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as out:
            out.write(file_content)

        print(f"  [+] Wrote {file_path} ({len(file_content)} bytes)")

    print("\nProject unpacked successfully!")

if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "COMPLETE_SOURCE_CODE.txt"
    unpack(src)
