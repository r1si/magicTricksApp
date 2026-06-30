import { create } from "zustand";

// Visibilità del "chrome" del contenitore di gioco (la X di uscita nel layout
// condiviso). Di default visibile; un gioco può nasconderlo durante momenti
// scenici (es. ACAAN in modalità scatolina nasconde la X dopo lo swipe). Va
// ripristinato a `false` allo smontaggio del gioco.
type GameChromeState = {
  hidden: boolean;
  setHidden: (v: boolean) => void;
};

export const useGameChrome = create<GameChromeState>((set) => ({
  hidden: false,
  setHidden: (hidden) => set({ hidden }),
}));
