import { describe, it, expect, beforeEach } from "vitest";
import { useAcaanStore } from "./store";

const reset = () => useAcaanStore.getState().reset();

describe("useAcaanStore", () => {
  beforeEach(reset);

  it("parte vuoto", () => {
    const s = useAcaanStore.getState();
    expect(s.firstSwipeSuit).toBeNull();
    expect(s.resolvedCard).toBeNull();
  });

  it("captureFirstSwipe fissa il seme dal quadrante", () => {
    useAcaanStore.getState().captureFirstSwipe(10, 10, 100, 100); // alto-sx
    expect(useAcaanStore.getState().firstSwipeSuit).toBe("hearts");
  });

  it("ignora i swipe successivi al primo", () => {
    const s = useAcaanStore.getState();
    s.captureFirstSwipe(10, 10, 100, 100); // ♥
    s.captureFirstSwipe(90, 90, 100, 100); // ♠ → deve essere ignorato
    expect(useAcaanStore.getState().firstSwipeSuit).toBe("hearts");
  });

  it("reveal senza seme non produce nulla", () => {
    useAcaanStore.getState().reveal(5);
    expect(useAcaanStore.getState().resolvedCard).toBeNull();
  });

  it("esempio specs: alto-sx + secondi 5 → 5 di Cuori", () => {
    const s = useAcaanStore.getState();
    s.captureFirstSwipe(10, 10, 100, 100);
    s.reveal(5);
    expect(useAcaanStore.getState().resolvedCard).toEqual({
      suit: "hearts",
      value: 5,
    });
  });

  it("reset ripulisce seme e carta", () => {
    const s = useAcaanStore.getState();
    s.captureFirstSwipe(10, 10, 100, 100);
    s.reveal(5);
    s.reset();
    const after = useAcaanStore.getState();
    expect(after.firstSwipeSuit).toBeNull();
    expect(after.resolvedCard).toBeNull();
  });
});
