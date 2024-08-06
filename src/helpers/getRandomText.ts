import texts from "../config/texts";

function getRandomText() {
  const randomIdx = Math.floor(Math.random() * texts.length);
  return texts[randomIdx];
}

export default getRandomText;
