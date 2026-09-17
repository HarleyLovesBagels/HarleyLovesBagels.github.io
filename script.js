const grid = document.querySelector("#repo-grid");
const year = document.querySelector("#year");
year.textContent = new Date().getFullYear();

const pinned = ["Calculator", "RandomGenerator", "Hangman", "RockPaperScissors", "BrokenCode-Examples"];

function card(repo) {
  const description = repo.description || "A project by Harley Jones.";
  const language = repo.language || "Code";
  const stars = repo.stargazers_count || 0;
  return `<article class="repo">
    <h3>${escapeHtml(repo.name)}</h3>
    <p>${escapeHtml(description)}</p>
    <div class="meta"><span>${escapeHtml(language)}</span><span>★ ${stars}</span></div>
    <a class="repo-link" href="${repo.html_url}" target="_blank" rel="noreferrer">View repository ↗</a>
  </article>`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
async function loadRepos() {
  try {
    const res = await fetch("https://api.github.com/users/HarleyLovesBagels/repos?sort=updated&per_page=100");
    if (!res.ok) throw new Error("GitHub API error");
    const repos = await res.json();
    repos.sort((a,b) => {
      const ai = pinned.indexOf(a.name), bi = pinned.indexOf(b.name);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    grid.innerHTML = repos.slice(0, 6).map(card).join("");
  } catch {
    grid.innerHTML = `<article class="repo"><h3>GitHub</h3><p>Projects are available on my GitHub profile.</p><a class="repo-link" href="https://github.com/HarleyLovesBagels" target="_blank" rel="noreferrer">Open GitHub ↗</a></article>`;
  }
}
loadRepos();
