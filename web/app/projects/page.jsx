import { getPosts } from '../../lib/posts';
import PostList from '../PostList';

export const metadata = { title: 'Projects', description: 'Platform and infrastructure projects: architecture, stack, and lessons.' };

export default function Projects() {
  const projects = getPosts('projects');
  return (
    <div className="home">
      <header className="post-header">
        <p className="eyebrow">~/projects</p>
        <h1>Projects</h1>
        <p className="meta">{metadata.description}</p>
      </header>
      <PostList posts={projects} more="View project →" />
    </div>
  );
}
