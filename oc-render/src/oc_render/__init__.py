"""Shared quarto render command for Overfitting Club blog posts."""

import os
import subprocess
import sys
from pathlib import Path


def main():
    """Find the .qmd file in the current directory and render it with Quarto."""
    qmd_files = list(Path(".").glob("*.qmd"))

    if not qmd_files:
        print("Error: no .qmd file found in the current directory.", file=sys.stderr)
        sys.exit(1)

    if len(qmd_files) > 1:
        print(
            f"Warning: multiple .qmd files found, rendering {qmd_files[0].name}",
            file=sys.stderr,
        )

    qmd_file = qmd_files[0]
    env = os.environ.copy()
    env["QUARTO_PYTHON"] = ".venv/bin/python"

    result = subprocess.run(
        ["quarto", "render", str(qmd_file)],
        env=env,
    )
    sys.exit(result.returncode)
