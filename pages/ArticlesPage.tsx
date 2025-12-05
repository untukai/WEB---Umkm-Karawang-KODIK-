
import React, { useState } from 'react';
import { Article } from '../types';
import { articles as initialArticles } from '../data/dummyData';
import ArticleCard from '../components/ArticleCard';
import Button from '../components/Button';
import Input from '../components/Input';
import { generateArticle } from '../services/geminiService';

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Topik tidak boleh kosong.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const newArticleData = await generateArticle(topic);
      const newArticle: Article = {
        id: Math.max(0, ...articles.map(a => a.id)) + 1, // Simple ID generation
        ...newArticleData,
      };
      setArticles(prevArticles => [newArticle, ...prevArticles]);
      setTopic(''); // Clear input after success
    } catch (err) {
      console.error(err);
      setError('Gagal membuat artikel. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-neutral-800 p-6 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">Inspirasi Lokal Karawang</h1>
        <p className="text-center text-neutral-600 dark:text-neutral-300 mt-2 max-w-2xl mx-auto">
          Temukan cerita, inovasi, dan potensi UMKM di Karawang melalui artikel-artikel pilihan kami.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg border border-primary/20 dark:border-primary/40">
        <h2 className="text-xl font-bold mb-4">Buat Artikel Baru dengan Bantuan AI</h2>
        <form onSubmit={handleGenerateArticle} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
              Masukkan Topik Artikel
            </label>
            <Input 
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Kisah sukses pengrajin batik Karawang"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Sedang Membuat...' : 'Buat Artikel'}
          </Button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Semua Artikel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
