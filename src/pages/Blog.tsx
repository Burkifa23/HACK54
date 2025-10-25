// Blog page for health education

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { getFromStorage, STORAGE_KEYS } from '../utils/storage';
import { BlogPost } from '../utils/types';
import { format } from 'date-fns';

export function Blog() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (id) {
    return <BlogPostDetail postId={id} />;
  }

  return <BlogList />;
}

function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const allPosts = getFromStorage<BlogPost[]>(STORAGE_KEYS.BLOG_POSTS, []);
    const published = allPosts.filter(p => p.status === 'published');
    published.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setPosts(published);
    setFilteredPosts(published);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.regions.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, posts]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Health Education Blog</h1>
        <p className="text-gray-600 mb-8">
          Latest news, alerts, and educational content about disease prevention in Ghana
        </p>

        {/* Search */}
        <div className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or region..."
                className="w-full pl-10 pr-4 py-3 border-2 border-black"
              />
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 border-2 border-gray-300">
            <p className="text-lg text-gray-600">No blog posts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="border-2 border-black hover:bg-gray-50 transition-colors"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h2>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.createdAt), 'PPP')}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {post.regions.length === 16 ? 'All Regions' : post.regions.join(', ')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    {post.content.substring(0, 150)}...
                  </p>

                  <div className="text-sm font-bold">Read More →</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BlogPostDetail({ postId }: { postId: string }) {
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const posts = getFromStorage<BlogPost[]>(STORAGE_KEYS.BLOG_POSTS, []);
    const found = posts.find(p => p.id === postId && p.status === 'published');
    setPost(found || null);
  }, [postId]);

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Blog post not found</p>
          <Link to="/blog" className="text-sm underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 mb-6 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blog</span>
        </button>

        <article className="border-2 border-black p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(post.createdAt), 'PPP')}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{post.regions.length === 16 ? 'All Regions' : post.regions.join(', ')}</span>
            </div>

            <div>
              <span className="font-bold">By:</span> {post.author}
            </div>
          </div>

          <div className="prose max-w-none">
            {post.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
