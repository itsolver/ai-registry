#!/usr/bin/env python3
"""Validate the static AI model registry without third-party dependencies."""

from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


PROVIDERS = {"GEMINI", "OPENAI", "XAI"}
PROVIDER_KEYS = {"gemini", "openai", "xai"}


def fail(message: str) -> None:
    raise SystemExit(f"registry validation failed: {message}")


def require_object(value: Any, path: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        fail(f"{path} must be an object")
    return value


def require_nonempty_string(value: Any, path: str) -> str:
    if not isinstance(value, str) or not value.strip():
        fail(f"{path} must be a non-empty string")
    return value.strip()


def validate_model_entry(value: Any, path: str) -> str:
    if isinstance(value, str):
        return require_nonempty_string(value, path)
    entry = require_object(value, path)
    if set(entry) != {"model"}:
        fail(f"{path} must contain only model")
    return require_nonempty_string(entry.get("model"), f"{path}.model")


def validate_provider_model_entry(value: Any, path: str) -> tuple[str, str]:
    entry = require_object(value, path)
    if set(entry) != {"provider", "model"}:
        fail(f"{path} must contain only provider and model")
    provider = require_nonempty_string(entry.get("provider"), f"{path}.provider")
    if provider not in PROVIDERS:
        fail(f"{path}.provider must be one of {', '.join(sorted(PROVIDERS))}")
    model = require_nonempty_string(entry.get("model"), f"{path}.model")
    return provider, model


def validate_registry(path: Path) -> None:
    try:
        registry = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        fail(f"{path} is not valid JSON: {error}")

    root = require_object(registry, "$")
    if set(root) != {"version", "updated_at", "models"}:
        fail("$ must contain only version, updated_at, and models")

    require_nonempty_string(root.get("version"), "$.version")
    updated_at = require_nonempty_string(root.get("updated_at"), "$.updated_at")
    try:
        datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
    except ValueError:
        fail("$.updated_at must be ISO 8601 date-time")

    models = require_object(root.get("models"), "$.models")
    if not models:
        fail("$.models must not be empty")

    for key, value in models.items():
        if key in PROVIDER_KEYS:
            tiers = require_object(value, f"$.models.{key}")
            if not tiers:
                fail(f"$.models.{key} must not be empty")
            for tier, tier_value in tiers.items():
                require_nonempty_string(tier, f"$.models.{key} tier name")
                validate_model_entry(tier_value, f"$.models.{key}.{tier}")
            continue

        logical = require_object(value, f"$.models.{key}")
        if "fallbacks" in logical:
            if set(logical) != {"fallbacks"}:
                fail(f"$.models.{key} fallback entries may only contain fallbacks")
            fallbacks = logical.get("fallbacks")
            if not isinstance(fallbacks, list) or not fallbacks:
                fail(f"$.models.{key}.fallbacks must be a non-empty array")
            for index, fallback in enumerate(fallbacks):
                validate_provider_model_entry(
                    fallback,
                    f"$.models.{key}.fallbacks[{index}]",
                )
            continue

        validate_provider_model_entry(logical, f"$.models.{key}")


def main() -> None:
    registry_path = Path(sys.argv[1] if len(sys.argv) > 1 else "model-registry.json")
    validate_registry(registry_path)
    print(f"validated {registry_path}")


if __name__ == "__main__":
    main()
