# Trucchi di Magia — Design System

> Linguaggio visivo dell'applicazione, derivato direttamente dal logo.
> L'app non è un generico "gioco di carte": è un **teatro tascabile**. Ogni
> scelta — colore, tipografia, bordi, movimento — deve trasmettere eleganza,
> mistero e il senso del "miracolo" della cartomagia.

---

## 1. Principi guida

1. **Il tappetino è il palco.** Il verde feltro non è uno sfondo qualunque: è
   la superficie su cui accade la magia. Sta sotto a tutto, sempre.
2. **L'avorio è la cornice.** Il bordo crema spesso che avvolge le carte nel
   logo è l'**elemento firma** dell'app (vedi §7). Lo riportiamo intorno alle
   superfici interattive.
3. **L'oro è l'accento, non la regola.** Le scintille dorate compaiono solo nei
   momenti "magici" (rivelazione, conferma, transizioni). Mai come decorazione
   di fondo diffusa.
4. **Discrezione = potere.** Gli elementi del metodo (l'orologio) sono volutamente
   sobri. L'eleganza qui è togliere, non aggiungere.

---

## 2. Palette colore

Colori estratti dal logo. Naming compatibile con Tailwind (`theme.extend.colors`).

### Colori brand
| Token | Hex | Uso |
|-------|-----|-----|
| `felt-900` | `#0E4D34` | Verde feltro profondo — bordi sfondo, vignettatura |
| `felt-700` | `#15603E` | Verde feltro base — sfondo principale |
| `felt-500` | `#1A6B47` | Verde feltro chiaro — centro del gradiente radiale |
| `royal-700` | `#27358A` | Blu reale scuro — ombre del dorso carta |
| `royal-500` | `#2E3D9E` | Blu reale — dorso classico delle carte |
| `ivory-50`  | `#F3ECDB` | Avorio — facce carte, cornici, testo su verde |
| `ivory-100` | `#EFE7D4` | Avorio ombreggiato — bordi interni |
| `wine-600`  | `#7E2030` | Bordeaux — semi rossi (cuori/quadri), accenti caldi |
| `wine-500`  | `#8B2433` | Bordeaux chiaro — hover su elementi rossi |
| `gold-500`  | `#DCA12C` | Oro — scintille, accenti "magici", focus |
| `gold-300`  | `#E8BE5C` | Oro chiaro — highlight scintille |

### Colori semantici (UI)
| Token | Valore | Uso |
|-------|--------|-----|
| `--bg` | `felt-700` | Sfondo app |
| `--surface` | `#0B3B28` | Card/pannelli sopra il feltro (verde più scuro) |
| `--text` | `ivory-50` | Testo primario su verde |
| `--text-muted` | `rgba(243,236,219,0.62)` | Testo secondario / etichette |
| `--accent` | `gold-500` | Azioni magiche, focus ring, badge |
| `--danger` | `wine-600` | Errori / azioni distruttive |
| `--success` | `gold-500` | Conferme (l'oro vale come "riuscito") |

### Gradiente di sfondo (il tappetino)
```css
background:
  radial-gradient(120% 90% at 50% 38%, var(--felt-500) 0%, var(--felt-700) 55%, var(--felt-900) 100%);
```
Replica il logo: più luminoso al centro-alto, scuro ai margini (vignettatura).

---

## 3. Tipografia

Tre ruoli, scelti per raccontare il brand — non i font di default.

| Ruolo | Font | Perché |
|-------|------|--------|
| **Display** | **Cinzel** (serif capitalino, inciso) | Evoca i manifesti dei prestigiatori e l'incisione classica. Solo MAIUSCOLO, usato con parsimonia: titolo app, nomi dei giochi. |
| **Body** | **Hanken Grotesk** (grotesque umanista) | Caldo, leggibile, moderno. Testi, descrizioni, UI generale. Alternativa: *Figtree*. |
| **Utility / dati** | **IBM Plex Mono** | Per numeri e dati "di macchina". **L'orologio del metodo usa il mono**: comunica precisione meccanica — coerente con la sua natura di contatore. |

> Scelta di struttura significativa: il mono è riservato a ciò che è
> "cronometrico/tecnico". Così l'orologio sembra un dettaglio funzionale e
> innocuo, mai un protagonista.

### Scala tipografica
| Livello | Dimensione (rem) | Peso | Font |
|---------|------------------|------|------|
| Display XL (titolo app) | 2.5 | 600 | Cinzel |
| Titolo gioco | 1.5 | 600 | Cinzel |
| H2 sezione | 1.25 | 600 | Hanken Grotesk |
| Body | 1.0 | 400 | Hanken Grotesk |
| Caption / etichetta | 0.8125 | 500 | Hanken Grotesk |
| Orologio / dati | 0.875 | 500 | IBM Plex Mono |

- Tracking ampio su Cinzel maiuscolo: `letter-spacing: 0.08em`.
- Body line-height `1.55` per comfort di lettura su feltro scuro.

---

## 4. Spaziatura e griglia

- **Base 4px**: scala `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`.
- Padding contenuti mobile: `16px` ai bordi.
- Gap griglia giochi: `16px`.
- Touch target minimo: **44×44px** (linee guida accessibilità mobile).

---

## 5. Forma e raggi (radius)

Il logo è uno **squircle** con angoli morbidi e generosi. Lo replichiamo.

| Token | Valore | Uso |
|-------|--------|-----|
| `radius-sm` | `8px` | Badge, chip |
| `radius-md` | `14px` | Bottoni, input |
| `radius-lg` | `22px` | Card dei giochi |
| `radius-xl` | `28px` | Pannelli, modali, contenitori principali |
| `radius-card` | `10px` | Carta da gioco (angoli reali di una carta) |

---

## 6. Elevazione e ombre

Le carte nel logo "galleggiano" sul feltro con ombre morbide e diffuse.

```css
--shadow-card:  0 8px 24px rgba(0,0,0,0.28);
--shadow-float: 0 14px 40px rgba(0,0,0,0.35);
--glow-gold:    0 0 24px rgba(220,161,44,0.45); /* solo momenti magici */
```

- Niente ombre dure o nette: sempre soffuse, coerenti con la luce da palco.
- Il `--glow-gold` è l'unico effetto "luminoso", riservato alla rivelazione.

---

## 7. Elemento firma — la "cornice avorio"

Nel logo, ogni carta è avvolta da un **bordo crema spesso**: è l'elemento più
riconoscibile. Lo eleviamo a motivo ricorrente dell'interfaccia.

- Le **card dei giochi** hanno un keyline avorio sottile (`1.5px ivory-50` a
  ~24% opacità) + raggio `radius-lg`: sembrano carte appoggiate sul tavolo.
- Lo stato **attivo/selezionato** ispessisce e accende leggermente il keyline.
- Lo stesso bordo separa pannelli e modali dal feltro.

```css
.keyline {
  border: 1.5px solid rgba(243, 236, 219, 0.24);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}
```

Questa coerenza fa sì che ogni superficie dell'app "sia" una carta.

---

## 8. Pattern dei componenti

### 8.1 Card gioco (Home)
- Contenitore `keyline` su feltro, raggio `radius-lg`.
- Icona del gioco, titolo in **Cinzel** maiuscolo, breve sottotitolo in body.
- **Stato `coming-soon`**: opacità ridotta (~0.5), lucchetto in avorio, niente
  glow. Comunica "in arrivo" senza gridarlo → rinforza l'idea di collezione
  che cresce.
- **Stato `available`**: pienamente a colori; al tap, leggero `scale(0.98)` +
  accenno di `--glow-gold`.

### 8.2 Bottone primario ("magico")
- Sfondo `ivory-50`, testo `felt-900`, raggio `radius-md`.
- Hover/press: alone `--glow-gold` discreto.
- Bottone secondario: trasparente con `keyline` avorio, testo avorio.

### 8.3 Orologio del metodo
- In alto a sinistra, **IBM Plex Mono**, colore `--text-muted`, dimensione
  piccola (`0.875rem`).
- Nessun riquadro, nessuna icona: deve sembrare un orpello innocuo.
- Formato `HH:MM:SS`. (I secondi sono il contatore controllato — vedi SPEC §4.)

### 8.4 Tavolo di gioco (scena ACAAN)
- Sfondo: gradiente feltro (§2) a tutto schermo.
- Mazzo 3D centrato; ombra a terra coerente con `--shadow-float`.
- Eventuali HUD/controlli minimi, in avorio a bassa opacità, ai margini.

### 8.5 Scintille / feedback magico
- Particelle dorate (`gold-300`/`gold-500`) che compaiono **solo** alla
  rivelazione della carta, poi svaniscono. Mai loop continuo di fondo.

---

## 9. Iconografia

- Stile **flat, vettoriale, line/solid coerente** col logo (no skeumorfismo,
  no gradienti carichi).
- Spessore tratto uniforme (~2px ottici).
- Semi delle carte (♥ ♦ ♣ ♠) come set iconografico nativo del brand: rossi in
  `wine-600`, neri in `felt-900`/avorio a seconda dello sfondo.
- Lucchetto, freccia, "i" informativa in avorio.

---

## 10. Movimento (motion)

La magia vive nei tempi giusti. Movimento mirato, mai gratuito.

| Interazione | Animazione | Durata / easing |
|-------------|------------|-----------------|
| Apertura card gioco | fade + slide-up 8px | 240ms · ease-out |
| Tap card disponibile | scale 0.98 → 1 | 120ms · ease-out |
| Scorrimento mazzo (swipe) | inerzia/spring | spring (react-spring) |
| **Flip carta (rivelazione)** | rotazione 180° + glow oro + scintille | 520ms · cubic-bezier(.2,.7,.2,1) |
| Comparsa scintille | fade-in/out scaglionato | 600ms totali |

- Rispettare **`prefers-reduced-motion`**: disattivare scintille e ridurre i
  flip a una dissolvenza.

---

## 11. Tema PWA e meta

```jsonc
// manifest.webmanifest (estratto)
{
  "name": "Trucchi di Magia",
  "short_name": "Magia",
  "background_color": "#15603E",   // felt-700
  "theme_color": "#0E4D34",        // felt-900
  "display": "standalone",
  "orientation": "portrait"
}
```
- Splash e icona: usare il logo fornito (squircle, sfondo verde).
- `theme-color` scuro per integrarsi con la barra di sistema.

---

## 12. Token pronti (Tailwind / CSS)

```ts
// tailwind.config.ts — theme.extend.colors
colors: {
  felt:  { 500: "#1A6B47", 700: "#15603E", 900: "#0E4D34" },
  royal: { 500: "#2E3D9E", 700: "#27358A" },
  ivory: { 50: "#F3ECDB", 100: "#EFE7D4" },
  wine:  { 500: "#8B2433", 600: "#7E2030" },
  gold:  { 300: "#E8BE5C", 500: "#DCA12C" },
}
```

```css
/* globals.css — variabili semantiche */
:root {
  --bg: #15603E;
  --surface: #0B3B28;
  --text: #F3ECDB;
  --text-muted: rgba(243, 236, 219, 0.62);
  --accent: #DCA12C;
  --danger: #7E2030;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --radius-xl: 28px;
  --radius-card: 10px;

  --shadow-card: 0 8px 24px rgba(0,0,0,0.28);
  --shadow-float: 0 14px 40px rgba(0,0,0,0.35);
  --glow-gold: 0 0 24px rgba(220,161,44,0.45);
}
```

---

## 13. Cosa evitare

- Sfondi diversi dal feltro verde nelle schermate principali.
- Oro usato come colore di riempimento ampio (resta accento puntuale).
- Ombre dure, bordi a spigolo vivo, raggi piccoli sulle superfici grandi.
- Animazioni continue di fondo (scintille perenni, loop): tradiscono il "fatto
  a macchina" e tolgono valore al momento magico.
- Font di sistema generici al posto della coppia Cinzel / Hanken Grotesk.
