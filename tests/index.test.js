import { sum } from "../src/index";

describe("sum", () => {
  it("should return the sum of 2 numbers", () => {
    const a = 5;
    const b = 11;

    const result = sum(a, b);

    expect(result).toBe(a + b);
  });
});
