# Jobb Finder – frontend

En liten Svelte/Vite-app för att söka jobb via ett separat API (AF + LinkedIn) och visa resultaten i en ren, Office-lik vy.

## Funktioner

- Sök på en eller flera städer och ett sökord.
- Hämtar jobbannonser från ett backend-API på `https://jobbfinder-api.vercel.app/jobs`.
- Visar antal sökträffar totalt och i hur många städer det finns träffar.
- Tydlig uppdelning mellan annonser från Arbetsförmedlingen (AF) och LinkedIn (LI).
- Sökformulär och senaste sökresultat sparas i `localStorage` och överlever sidladdning.

## Kom igång

### 1. Installera beroenden

```bash
npm install
```

### 2. Backend-API

API:t ligger redan online. Frontenden förväntar sig ett API på:

```text
GET https://jobbfinder-api.vercel.app/jobs?city=<städer>&q=<sökord>
```

`city` kan vara en kommaseparerad lista (t.ex. `Lund,Malmö`) och `q` är sökordet.

### 3. Starta utvecklingsservern

```bash
npm run dev
```

Öppna sedan den URL som Vite skriver ut (oftast `http://localhost:5173`).

## Viktiga filer

- `src/App.svelte` – appens skal (header + layout).
- `src/lib/Filter.svelte` – sökformulär och load-logik mot API.
- `src/lib/AfList.svelte` – presentation av resultat, träffräknare, grouping per stad.
- `src/store/jobs.js` – Svelte-store för jobbdata, inklusive persistens i `localStorage`.
- `src/store/search.js` – persisted store för senaste sökfilter (stad/sökord).
- `src/app.scss` – global styling, färgtema och layout.

## Persistens

Appen använder Svelte stores + `localStorage` för att komma ihåg:

- Senaste använda filter (stad/sökord).
- Senaste hämtade jobbresultat.

Det innebär att när du laddar om sidan ligger både sökfält och lista kvar, tills du gör en ny sökning eller rensar datan i din browser.

## Utvecklingsmiljö

Rekommenderad editor:

- [VS Code](https://code.visualstudio.com/) med tillägget [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

Projektet är genererat med `create-vite` + Svelte och har sedan anpassats för den här jobb-sökarappen.

```

```
