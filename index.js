const fromText = document.querySelector(".from-text");
const toText = document.querySelector(".to-text");
const exchangeIcon = document.querySelector(".exchange i");
const selectTags = document.querySelectorAll("select");
const icons = document.querySelectorAll(".row i");
const translateBtn = document.querySelector(".translate-btn");

// Convert locale → MyMemory language code (ru-RU -> ru)
function toMyMemoryLang(locale) {
  return locale.split("-")[0].toLowerCase();
}

// Populate selects ONCE
selectTags.forEach((select, index) => {
  select.innerHTML = "";
  for (let code in countries) {
    const selected =
      index === 0
        ? (code === "en-GB" ? "selected" : "")
        : (code === "de-DE" ? "selected" : "");

    select.insertAdjacentHTML(
      "beforeend",
      `<option value="${code}" ${selected}>${countries[code]}</option>`
    );
  }
});

// Swap text + languages
exchangeIcon.addEventListener("click", () => {
  const tempText = fromText.value;
  fromText.value = toText.value;
  toText.value = tempText;

  const tempLang = selectTags[0].value;
  selectTags[0].value = selectTags[1].value;
  selectTags[1].value = tempLang;
});

// Translate (MyMemory)
translateBtn.addEventListener("click", async () => {
  const text = fromText.value.trim();
  if (!text) return;

  const fromLang = toMyMemoryLang(selectTags[0].value);
  const toLang = toMyMemoryLang(selectTags[1].value);

  toText.value = "Translating...";

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    const res = await fetch(url);
    const data = await res.json();

    const translated = data?.responseData?.translatedText;
    toText.value = translated && translated.trim() ? translated : "No translation found.";
  } catch (err) {
    toText.value = "Translation failed. Check your internet.";
  }
});

// Copy + Speak
icons.forEach((icon) => {
  icon.addEventListener("click", () => {
    // Copy
    if (icon.classList.contains("fa-copy")) {
      if (icon.classList.contains("copy-from")) {
        navigator.clipboard.writeText(fromText.value);
      } else if (icon.classList.contains("copy-to")) {
        navigator.clipboard.writeText(toText.value);
      }
    }

    // Speak
    if (icon.classList.contains("fa-volume-up")) {
      const textToSpeak = icon.classList.contains("speak-from")
        ? fromText.value
        : toText.value;

      if (!textToSpeak.trim()) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = icon.classList.contains("speak-from")
        ? selectTags[0].value
        : selectTags[1].value;

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  });
});
