import { getPublishedProjects, getPublishedWriting } from './collections';

export async function getLlmChatContext() {
  const [projects, writing] = await Promise.all([
    getPublishedProjects(),
    getPublishedWriting(),
  ]);

  return {
    projects: projects.map((project) => ({
      title: project.data.title,
      year: project.data.year,
      description: project.data.description,
      href: `/projects/${project.slug}`,
    })),
    writing: writing.map((post) => ({
      title: post.data.title,
      date: post.data.date.toISOString().slice(0, 10),
      description: post.data.description,
      href: `/writing/${post.slug}`,
    })),
  };
}
