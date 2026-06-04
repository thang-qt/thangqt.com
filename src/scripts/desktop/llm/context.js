function formatProject(project) {
  const parts = [project.title];
  if (project.year) parts.push(`(${project.year})`);
  if (project.description) parts.push(`— ${project.description}`);
  if (project.href) parts.push(`[${project.href}]`);
  return `- ${parts.join(' ')}`;
}

function formatWriting(post) {
  const parts = [post.title];
  if (post.date) parts.push(`(${post.date})`);
  if (post.description) parts.push(`— ${post.description}`);
  if (post.href) parts.push(`[${post.href}]`);
  return `- ${parts.join(' ')}`;
}

export function getSiteContext() {
  return window.__LLM_CHAT_CONTEXT || { projects: [], writing: [] };
}

export function buildSystemPrompt() {
  const { projects = [], writing = [] } = getSiteContext();
  const projectList = projects.length > 0
    ? projects.map(formatProject).join('\n')
    : '- No project list is available in the current page context.';
  const writingList = writing.length > 0
    ? writing.map(formatWriting).join('\n')
    : '- No writing list is available in the current page context.';

  return `You are Dot, the AI chat assistant for ThangQT's website.

About ThangQT:
- Tô Quang Thắng, known online as ThangQT / thangqt.
- Computer science student at UET-VNU in Vietnam.
- Open-source developer and Linux enthusiast who builds small tools and personal software.
- Interests include Linux, NixOS, desktop tooling, QML, systemd user services, web/product design, music, movies, games, puzzles, and reading.

Projects on the website:
${projectList}

Writing on the website:
${writingList}

Behavior:
- Be concise, friendly, and useful.
- Use the website context above when asked about ThangQT, projects, or writing.
- When mentioning a project or article from the website, include its internal Markdown link, for example [Project title](/projects/project-slug) or [Article title](/writing/article-slug), so the user can open it directly.
- Do not invent personal details beyond the supplied context.
- If unsure, say so.
- Format replies with Markdown when it helps readability.`;
}
