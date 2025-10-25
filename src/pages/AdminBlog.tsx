// Admin blog management

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { BlogPost, BlogStatus } from '../utils/types';
import { GHANA_REGIONS, GhanaRegion } from '../data/regions';

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    regions: [] as GhanaRegion[],
    status: 'draft' as BlogStatus
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const allPosts = getFromStorage<BlogPost[]>(STORAGE_KEYS.BLOG_POSTS, []);
    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setPosts(allPosts);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      regions: [],
      status: 'draft'
    });
    setEditingPost(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || formData.regions.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const allPosts = getFromStorage<BlogPost[]>(STORAGE_KEYS.BLOG_POSTS, []);

    if (editingPost) {
      // Update existing post
      const updated = allPosts.map(p =>
        p.id === editingPost.id
          ? {
              ...p,
              title: formData.title,
              content: formData.content,
              regions: formData.regions,
              status: formData.status,
              publishedAt: formData.status === 'published' ? new Date().toISOString() : p.publishedAt
            }
          : p
      );
      saveToStorage(STORAGE_KEYS.BLOG_POSTS, updated);
    } else {
      // Create new post
      const newPost: BlogPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        content: formData.content,
        regions: formData.regions,
        status: formData.status,
        createdAt: new Date().toISOString(),
        publishedAt: formData.status === 'published' ? new Date().toISOString() : undefined,
        author: 'Admin'
      };
      allPosts.push(newPost);
      saveToStorage(STORAGE_KEYS.BLOG_POSTS, allPosts);
    }

    loadPosts();
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const allPosts = getFromStorage<BlogPost[]>(STORAGE_KEYS.BLOG_POSTS, []);
      const updated = allPosts.filter(p => p.id !== id);
      saveToStorage(STORAGE_KEYS.BLOG_POSTS, updated);
      loadPosts();
    }
  };

  const startEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      regions: post.regions,
      status: post.status
    });
    setShowForm(true);
  };

  const toggleRegion = (region: GhanaRegion) => {
    if (formData.regions.includes(region)) {
      setFormData({
        ...formData,
        regions: formData.regions.filter(r => r !== region)
      });
    } else {
      setFormData({
        ...formData,
        regions: [...formData.regions, region]
      });
    }
  };

  const selectAllRegions = () => {
    setFormData({ ...formData, regions: [...GHANA_REGIONS] });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Blog Post Management</h1>
            <p className="text-gray-600">{posts.length} total posts</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              resetForm();
            }}
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New Post
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 border-2 border-black p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border-2 border-black"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Target Regions *</label>
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={selectAllRegions}
                    className="text-sm underline hover:text-gray-600"
                  >
                    Select All Regions
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {GHANA_REGIONS.map(region => (
                    <label
                      key={region}
                      className={`flex items-center gap-2 p-2 border-2 cursor-pointer ${
                        formData.regions.includes(region)
                          ? 'border-black bg-gray-100'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.regions.includes(region)}
                        onChange={() => toggleRegion(region)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 border-2 border-black h-64"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BlogStatus })}
                  className="w-full p-3 border-2 border-black"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  {editingPost ? 'Update' : 'Create'} Post
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border-2 border-black hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="border-2 border-black p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Status: <strong>{post.status}</strong></span>
                    <span>Regions: {post.regions.length === GHANA_REGIONS.length ? 'All' : post.regions.length}</span>
                    <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(post)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 hover:bg-red-100 text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
