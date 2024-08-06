import gameCompletedEvent from "./Events/gameCompleted.js";

let textIdx = 0;
const text = document.getElementById("gameText").getAttribute("data-text").trim();

/**
 * @param {Event} event 
 */
export function handleGameStart(event) {
  event.target.setAttribute("placeholder", "");
  event.target.removeAttribute("disabled");
  event.target.focus()

  const roomId = document.getElementById("room").getAttribute("data-roomId");
  const progressUpdateInterval = setInterval(() => {
    const percentageCompleted = Number((textIdx / text.length).toFixed(2))
    const progress = Math.min(100, percentageCompleted);

    const wpmContainer = document.getElementById("countdown-wpm");
    const wpm = calculateWPM(textIdx, Date.now() - window.startTime)
    wpmContainer.textContent = `WPM: ${wpm}`;
    window.socket.emit("incomingProgress", { roomId, progress, wpm });
  }, 2000);

  event.target.addEventListener("gameCompleted", () => {
    clearInterval(progressUpdateInterval);
    const wpm = document.getElementById("countdown-wpm").textContent.split(" ")[1];
    window.socket.emit("incomingProgress", { roomId, progress: 100, wpm });

    event.target.value = "";
    event.target.setAttribute("disabled", true);
    event.target.setAttribute("placeholder", "Finished!");
    event.target.removeEventListener("keydown", handleKeyPress);
    event.target.removeEventListener("gameStart", handleGameStart);
  });
}

/**
 * @param {KeyboardEvent} e 
 * @param {HTMLSpanElement} next Div containing the next letter to be typed
 * @param {HTMLSpanElement} completed Div containing typed letters
 * @param {HTMLSpanElement} textArea Div containing the game text
 */
export function handleKeyPress(e, next, completed, textArea) {
  e.stopPropagation();
  // ignore non alpha characters, e.g. "Space"
  if (e.key.length > 1) return;

  if (e.key === text[textIdx]) {
    textIdx += 1;
    // Remove erroneous styles if present
    next.classList.remove("text-red-400");
    e.target.classList.remove("bg-red-500");

    // clear the textbox on each word
    if (e.key === " ") {
      e.preventDefault();
      e.target.value = "";
    }

    completed.textContent += e.key;
    textArea.textContent = textArea.textContent.substring(1);
    next.textContent = text[textIdx];
  } else {
    e.preventDefault();
    next.classList.add("text-red-400");
    e.target.classList.add("bg-red-500");
  }

  if (textIdx === text.length) e.target.dispatchEvent(gameCompletedEvent);
}

/**
 * Updates the player's position & wpm in the player container.
 * 
 * @param {string} playerId The player id to update
 * @param {number} finished The place the player finished in
 * @param {number} progress The percent of the entire text the user has typed
 * @param {string} wpm The player's wpm
 */
export function updatePlayerPosition(playerId, progress, wpm, finished) {
  const playerAvatarDiv = document.getElementById(playerId);
  playerAvatarDiv.style.transform = `translateX(${calculatePlayerAdvance(progress)}px)`
  const playerWpm = document.getElementById(`${playerId}-wpm`);
  playerWpm.textContent = `WPM ${wpm}`
  if (progress && progress === 100) {
    playerWpm.textContent += ` - ${showPlayerFinish(finished)}`
  }
}

/**
 * Show where a player finished.
 * 
 * @param {number} place player's finish position
 */
function showPlayerFinish(place) {
  switch (place) {
    case 1:
      return "1st place!"
      case 2:
      return "2nd place!"
      case 3:
      return "3rd place!"
      case 4:
      return "4th place!"
    default:
      break;
  }
}

/**
 * Returns the number in pixels to translate a player's icon
 * to indicate their current progress level
 * 
 * @param {number} progressLevel The user's current progress level, as a percent of words typed compared to the total number of words in the text.
 * @returns {number}
 */
function calculatePlayerAdvance(progressLevel) {
  /**
   * Number that puts player right at the end when
   * subtracted from the progress container's client width.
   * i suck so idk why but it works
   */
  const offset = 150
  const progressContainer = document.getElementById("progressContainer");
  const finishLinePosition = progressContainer.clientWidth - offset;
  return progressLevel < 100 ? finishLinePosition * progressLevel : finishLinePosition;
}

/**
 * Calculate the wpm - the formula is (keys pressed / 5) / time elapsed in minutes)
 * 
 * @param {number} typed the number of characters that have been typed
 * @param {number} elapsed the amount of time that has passed since the start of the race in ms
 * 
 */
function calculateWPM(typed, elapsed) {
  const elapsedInMinutes = (elapsed / 60_000).toFixed(3);
  return Math.floor((typed / 5) / elapsedInMinutes);
}
