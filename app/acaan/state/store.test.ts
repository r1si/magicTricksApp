import { describe, it, expect, beforeEach } from "vitest";
import { useAcaanStore } from "./store";

const reset = () => useAcaanStore.getState().reset();

describe("useAcaanStore", () => {
  beforeEach(reset);

  it("parte vuoto", () => {
    const s = useAcaanStore.getState();
    expect(s.suit).toBeNull();
    expect(s.valueSeconds).toBeNull();
    expect(s.resolvedCard).toBeNull();
  });

  it("captureSuit fissa il seme dal quadrante", () => {
    useAcaanStore.getState().captureSuit(10, 10, 100, 100); // alto-sx
    expect(useAcaanStore.getState().suit).toBe("hearts");
  });

  it("ignora le catture successive alla prima", () => {
    const s = useAcaanStore.getState();
    s.captureSuit(10, 10, 100, 100); // ♥
    s.captureSuit(90, 90, 100, 100); // ♠ → ignorato
    expect(useAcaanStore.getState().suit).toBe("hearts");
    s.captureSeconds(5);
    s.captureSeconds(40); // ignorato
    expect(useAcaanStore.getState().valueSeconds).toBe(5);
  });

  it("reveal senza seme non produce nulla", () => {
    useAcaanStore.getState().reveal(5);
    expect(useAcaanStore.getState().resolvedCard).toBeNull();
  });

  it("ripiego: senza secondi fissati usa quelli passati al reveal", () => {
    const s = useAcaanStore.getState();
    s.captureSuit(10, 10, 100, 100); // ♥
    s.reveal(5); // nessun valueSeconds fissato → usa 5
    expect(useAcaanStore.getState().resolvedCard).toEqual({
      suit: "hearts",
      value: 5,
    });
  });

  it("i secondi fissati hanno precedenza su quelli del reveal", () => {
    const s = useAcaanStore.getState();
    s.captureSuit(90, 10, 100, 100); // ♦ alto-dx
    s.captureSeconds(13); // valore fissato sulla prima carta
    s.reveal(40); // i secondi correnti vengono ignorati
    expect(useAcaanStore.getState().resolvedCard).toEqual({
      suit: "diamonds",
      value: 13,
    });
  });

  it("reset ripulisce seme, secondi e carta", () => {
    const s = useAcaanStore.getState();
    s.captureSuit(10, 10, 100, 100);
    s.captureSeconds(5);
    s.reveal(5);
    s.reset();
    const after = useAcaanStore.getState();
    expect(after.suit).toBeNull();
    expect(after.valueSeconds).toBeNull();
    expect(after.resolvedCard).toBeNull();
  });
});
