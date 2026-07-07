import { describe, it, expect } from "vitest";
import { chunkRows } from "../services/chunker.service.js";

describe("chunkRows", () => {
  it("splits an array into fixed-size chunks", () => {
    const input = [1, 2, 3, 4, 5, 6, 7];
    const result = chunkRows(input, 3);

    expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  it("returns a single chunk when input is smaller than batch size", () => {
    const input = [1, 2];
    const result = chunkRows(input, 25);

    expect(result).toEqual([[1, 2]]);
  });

  it("returns empty array for empty input", () => {
    expect(chunkRows([], 10)).toEqual([]);
  });

  it("uses default batch size of 25", () => {
    const input = Array.from({ length: 50 }, (_, i) => i);
    const result = chunkRows(input);

    expect(result.length).toBe(2);
    expect(result[0].length).toBe(25);
    expect(result[1].length).toBe(25);
  });

  it("handles exact multiples of batch size", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const result = chunkRows(input, 3);

    expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
  });
});
