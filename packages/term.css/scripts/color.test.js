import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { oklchToLuminance, contrastRatio } from "./color.js";

// Tolerance for floating-point comparisons
const EPSILON = 0.005;

function approx(actual, expected, msg) {
  assert.ok(
    Math.abs(actual - expected) < EPSILON,
    `${msg}: expected ~${expected}, got ${actual}`,
  );
}

describe("oklchToLuminance", () => {
  it("returns ~1.0 for white (L=1, C=0)", () => {
    approx(oklchToLuminance(1, 0, 0), 1.0, "white");
  });

  it("returns ~0.0 for black (L=0, C=0)", () => {
    approx(oklchToLuminance(0, 0, 0), 0.0, "black");
  });

  it("achromatic colors reduce to L³", () => {
    // When C=0, the conversion simplifies to Y = L³ regardless of hue
    for (const L of [0.2, 0.4, 0.5, 0.7, 0.9]) {
      approx(oklchToLuminance(L, 0, 0), L ** 3, `gray L=${L}`);
      approx(oklchToLuminance(L, 0, 180), L ** 3, `gray L=${L} H=180`);
    }
  });

  it("chroma affects luminance (blue has less luminance than green at same L)", () => {
    const green = oklchToLuminance(0.7, 0.15, 145);
    const blue = oklchToLuminance(0.7, 0.15, 265);
    assert.ok(
      green > blue,
      `green (${green.toFixed(4)}) should have higher luminance than blue (${blue.toFixed(4)})`,
    );
  });

  it("returns values in [0, 1] range for typical OKLCH inputs", () => {
    const testCases = [
      [0.5, 0.15, 0],
      [0.5, 0.15, 90],
      [0.5, 0.15, 180],
      [0.5, 0.15, 270],
      [0.3, 0.10, 25],
      [0.8, 0.20, 145],
      [0.6, 0.25, 300],
    ];
    for (const [L, C, H] of testCases) {
      const Y = oklchToLuminance(L, C, H);
      assert.ok(Y >= -EPSILON && Y <= 1 + EPSILON, `L=${L} C=${C} H=${H} → Y=${Y} out of range`);
    }
  });

  it("higher L produces higher luminance for same C and H", () => {
    for (const H of [0, 90, 180, 270]) {
      const Y1 = oklchToLuminance(0.3, 0.10, H);
      const Y2 = oklchToLuminance(0.6, 0.10, H);
      const Y3 = oklchToLuminance(0.9, 0.10, H);
      assert.ok(Y1 < Y2, `H=${H}: L=0.3 should be darker than L=0.6`);
      assert.ok(Y2 < Y3, `H=${H}: L=0.6 should be darker than L=0.9`);
    }
  });

  // Known sRGB reference: pure sRGB red (1,0,0) has relative luminance 0.2126
  // sRGB red in OKLCH ≈ (0.6279, 0.2577, 29.23)
  it("matches known sRGB red luminance", () => {
    const Y = oklchToLuminance(0.6279, 0.2577, 29.23);
    approx(Y, 0.2126, "sRGB red");
  });

  // Known sRGB reference: pure sRGB blue (0,0,1) has relative luminance 0.0722
  // sRGB blue in OKLCH ≈ (0.4520, 0.3132, 264.05)
  it("matches known sRGB blue luminance", () => {
    const Y = oklchToLuminance(0.4520, 0.3132, 264.05);
    approx(Y, 0.0722, "sRGB blue");
  });
});

describe("contrastRatio", () => {
  it("returns 21:1 for white vs black", () => {
    const ratio = contrastRatio(1.0, 0.0);
    approx(ratio, 21.0, "white/black");
  });

  it("returns 1:1 for identical luminances", () => {
    assert.strictEqual(contrastRatio(0.5, 0.5), 1.0);
  });

  it("is symmetric (order of arguments does not matter)", () => {
    const r1 = contrastRatio(0.8, 0.1);
    const r2 = contrastRatio(0.1, 0.8);
    assert.strictEqual(r1, r2);
  });

  it("WCAG AA: 4.5:1 for normal text", () => {
    // Two colors that should barely pass 4.5:1
    const bgY = 1.0;
    const textY = (bgY + 0.05) / 4.5 - 0.05; // exact threshold
    approx(contrastRatio(bgY, textY), 4.5, "threshold");
  });
});

describe("WCAG integration", () => {
  it("white bg vs dark text passes 4.5:1", () => {
    const bgY = oklchToLuminance(0.97, 0.01, 0);
    const textY = oklchToLuminance(0.20, 0.02, 0);
    const ratio = contrastRatio(bgY, textY);
    assert.ok(ratio >= 4.5, `Expected >= 4.5:1, got ${ratio.toFixed(2)}:1`);
  });

  it("dark bg vs light text passes 4.5:1", () => {
    const bgY = oklchToLuminance(0.15, 0.02, 0);
    const textY = oklchToLuminance(0.85, 0.02, 0);
    const ratio = contrastRatio(bgY, textY);
    assert.ok(ratio >= 4.5, `Expected >= 4.5:1, got ${ratio.toFixed(2)}:1`);
  });

  it("yellow on light bg is the hardest contrast case", () => {
    // Yellow (H≈85) has high luminance even at moderate L,
    // making it hard to contrast against light backgrounds
    const bgY = oklchToLuminance(0.97, 0.01, 0);
    const brightYellow = oklchToLuminance(0.70, 0.16, 85);
    const darkYellow = oklchToLuminance(0.50, 0.16, 85);
    const brightRatio = contrastRatio(bgY, brightYellow);
    const darkRatio = contrastRatio(bgY, darkYellow);
    assert.ok(brightRatio < 4.5, `Bright yellow should fail AA: ${brightRatio.toFixed(2)}:1`);
    assert.ok(darkRatio >= 4.5, `Dark yellow should pass AA: ${darkRatio.toFixed(2)}:1`);
  });
});
