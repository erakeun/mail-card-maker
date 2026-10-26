// Shared selection stays in the existing editor; only visible dot thumbnails load.
let dotThumbnailObserver = null;

function selectedCharacter() {
  return characters.find(character => character.file === elCharacter.value);
}

function refreshDotThumbnails() {
  const grid = document.getElementById("dotThumbnails");
  dotThumbnailObserver?.disconnect();
  grid.replaceChildren();
  const dots = elCategory.value.startsWith("dot-") ? filteredCharacters.filter(character => character.isDot) : [];
  grid.classList.toggle("hidden", !dots.length);
  if ("IntersectionObserver" in window) {
    dotThumbnailObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.src = entry.target.dataset.src;
        dotThumbnailObserver.unobserve(entry.target);
      });
    }, { root: grid, rootMargin: "50px" });
  }
  dots.forEach(character => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dot-pose";
    button.dataset.file = character.file;
    button.setAttribute("aria-label", character.label);
    button.setAttribute("aria-pressed", String(character.file === elCharacter.value));
    const image = document.createElement("img");
    image.alt = "";
    image.width = 72;
    image.height = 72;
    image.loading = "lazy";
    image.decoding = "async";
    image.dataset.src = character.file;
    const label = document.createElement("span");
    label.textContent = character.label;
    button.append(image, label);
    button.addEventListener("click", () => {
      elCharacter.value = character.file;
      updateCharacterAndDraw();
    });
    grid.appendChild(button);
    if (dotThumbnailObserver) dotThumbnailObserver.observe(image);
    else image.src = character.file;
  });
}

function syncDotSelection() {
  const character = selectedCharacter();
  document.querySelectorAll(".dot-pose").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.file === elCharacter.value));
  });
  elCharPreview.classList.toggle("pixel-art", Boolean(character?.isDot));
  elCharPreview.alt = character ? `${character.label} 미리보기` : "캐릭터 미리보기";
  document.getElementById("charFlipWarning").classList.toggle("hidden", !character?.hasText);
  document.getElementById("charFlipWarning").textContent = elCharFlip.checked
    ? "문자가 있는 포즈를 좌우반전하면 글자도 거꾸로 보여. 저장 전에 확인해줘."
    : "문자가 있는 포즈야. 좌우반전하면 글자도 함께 뒤집혀.";
}
