function addWord(word) {
  const searchUrl = buildSearchUrl(word);
  fetch(searchUrl)
    .then((response) => response.text())
    .then((response) => parseHTML(response))
    .then((html) => enrichedInfo(html))
    .then((enrichedInfo) =>
      requestAddCard(buildGUIAddCardsRequest(word, enrichedInfo))
    );
}

function parseHTML(response) {
  const parser = new DOMParser();
  return parser.parseFromString(response, 'text/html');
}

function firstDefinition(meaning) {
  return meaning.split(';')[0];
}

function sanitise(text) {
  return text.replaceAll(/\n/g, '').trim();
}

function buildGUIAddCardsRequest(word, enrichedInfo) {
  return {
    action: 'guiAddCards',
    version: 6,
    params: {
      note: {
        deckName: 'Japanese::Vocabulary',
        modelName: 'Japanese vocabulary',
        fields: {
          Word: word,
          Meaning: enrichedInfo.meaning,
          Romanji: '',
          Kanji: enrichedInfo.kanji,
        },
      },
    },
  };
}

function requestAddCard(request) {
  fetch('http://localhost:8765', {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function enrichedInfo(html) {
  const meaning = firstDefinition(
    html.querySelector('span.meaning-meaning').innerText
  );
  const kanji = sanitise(
    html.querySelector('#main_results span.text').innerText
  );

  return {
    meaning,
    kanji,
  };
}

function buildSearchUrl(word) {
  return `https://jisho.org/search/${word}`;
}

document.getElementById('btn').addEventListener('click', (e) => {
  const word = document.getElementById('word').value;

  if (word !== undefined && word.trim().length > 0) {
    addWord(word.trim());
  }
});
