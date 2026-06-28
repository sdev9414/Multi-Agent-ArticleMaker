"""Token cost estimation. Prices are per 1M tokens (USD); edit here to update."""
from __future__ import annotations

# ponytail: static price table; refresh when provider pricing changes.
# (input_per_1m, output_per_1m)
_PRICES: dict[str, tuple[float, float]] = {
    "gpt-5.5": (5.0, 15.0),
    "gemini-2.5-pro": (3.5, 10.5),
    "gemini-2.5-flash": (0.30, 2.50),
    "mock-1": (0.0, 0.0),
}

_DEFAULT = (5.0, 15.0)


def estimate_cost(model: str, tokens_input: int, tokens_output: int) -> float:
    """Return estimated USD cost for a call. Rounded to 5 decimals."""
    in_price, out_price = _PRICES.get(model, _DEFAULT)
    cost = (tokens_input / 1_000_000) * in_price + (tokens_output / 1_000_000) * out_price
    return round(cost, 5)
