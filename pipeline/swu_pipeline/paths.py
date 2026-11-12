"""Where things live on disk, so every module agrees."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / "data"
# Raw API responses. Not committed to git (see .gitignore).
RAW_DIR = REPO_ROOT / "pipeline" / "raw"
