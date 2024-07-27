// eslint-disable-next-line @typescript-eslint/no-unused-vars
function copyJoinLinkToClipboard(inviteLink) {
  navigator.clipboard.writeText(window.location.href + inviteLink);

  const linkButton = document.getElementById("copyLinkButton");
  const oldText = linkButton.textContent;
  linkButton.textContent = "Copied!";
  linkButton.setAttribute("disabled", true);
  linkButton.classList.replace("bg-blue-600", "bg-green-600");

  const revert = setTimeout(() => {
    linkButton.textContent = oldText;
    linkButton.setAttribute("disabled", false);
    linkButton.classList.replace("bg-green-600", "bg-blue-600");
    clearTimeout(revert);
  }, 1500);
}
