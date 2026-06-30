// Orologio del metodo (vedi specs.md §4). Ore/minuti REALI; i secondi sono un
// contatore che parte da 0 all'apertura del gioco e cicla 0..59 — identico, come
// intervallo, ai secondi di un vero orologio (così la modalità "telefono" che
// legge l'ora di sistema usa la stessa mappatura).
// Funzioni pure con tempo iniettato (startMs/nowMs) per la testabilità.

export type ClockReadout = { hh: number; mm: number; ss: number };

/** Contatore dei secondi del metodo: 0 all'avvio, +1/s, dopo 59 riparte da 0. */
export function methodSeconds(startMs: number, nowMs: number): number {
  const elapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000));
  return elapsed % 60;
}

/** Secondi reali dell'orologio di sistema (0..59) — modalità "telefono". */
export function realSeconds(nowMs: number): number {
  return new Date(nowMs).getSeconds();
}

/** Ore e minuti reali dal tempo di sistema. */
export function realHoursMinutes(nowMs: number): { hh: number; mm: number } {
  const d = new Date(nowMs);
  return { hh: d.getHours(), mm: d.getMinutes() };
}

/** Readout completo: HH/MM reali + secondi del contatore. */
export function methodClock(startMs: number, nowMs: number): ClockReadout {
  const { hh, mm } = realHoursMinutes(nowMs);
  return { hh, mm, ss: methodSeconds(startMs, nowMs) };
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Formatta come "HH:MM:SS". */
export function formatClock(c: ClockReadout): string {
  return `${pad2(c.hh)}:${pad2(c.mm)}:${pad2(c.ss)}`;
}
