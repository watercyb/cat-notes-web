import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import { setToken, getToken } from "../../../utils/tokens.js";

describe("tokens", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should set and get a token", () => {
    setToken(123, "abc");

    expect(getToken(123)).toBe("abc");
  });

  it("should convert userId to a string", () => {
    setToken(123, "abc");

    expect(getToken("123")).toBe("abc");
  });

  it("should delete the token after 15 minutes", () => {
    setToken(123, "abc");

    expect(getToken(123)).toBe("abc");

    vi.advanceTimersByTime(15 * 60 * 1000);

    expect(getToken(123)).toBeUndefined();
  });

  it("should reset the timeout when setting a token again", () => {
    setToken(123, "abc");

    vi.advanceTimersByTime(10 * 60 * 1000);

    setToken(123, "def");

    expect(getToken(123)).toBe("def");

    // 10 minutes after the second set: token should still exist
    vi.advanceTimersByTime(10 * 60 * 1000);

    expect(getToken(123)).toBe("def");

    // 5 more minutes = 15 minutes after the second set
    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(getToken(123)).toBeUndefined();
  });

  it("should keep tokens for different users independent", () => {
    setToken(1, "token1");
    setToken(2, "token2");

    expect(getToken(1)).toBe("token1");
    expect(getToken(2)).toBe("token2");

    vi.advanceTimersByTime(15 * 60 * 1000);

    expect(getToken(1)).toBeUndefined();
    expect(getToken(2)).toBeUndefined();
  });
});