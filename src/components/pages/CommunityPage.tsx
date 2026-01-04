import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  Search,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DiscussionTopic, UserProfile } from '../../types';

interface CommunityPageProps {
  onSelectTopic: (topicId: string) => void;
}

export function CommunityPage({ onSelectTopic }: CommunityPageProps) {
  const [topics, setTopics] = useState<(DiscussionTopic & { author: UserProfile | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopics() {
      const { data } = await supabase
        .from('discussion_topics')
        .select('*, author:user_profiles(*)')
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false });

      if (data) {
        setTopics(data as (DiscussionTopic & { author: UserProfile | null })[]);
      }
      setLoading(false);
    }

    loadTopics();
  }, []);

  const allTags = [...new Set(topics.flatMap((t) => t.tags))];

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      searchQuery === '' ||
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === null || topic.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'A l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return then.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Communaute</h1>
          <p className="text-slate-400">Echangez avec d'autres acteurs associatifs</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all">
          <Plus size={18} />
          Nouvelle discussion
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une discussion..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedTag === null
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                Tous
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTag === tag
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {filteredTopics.length > 0 ? (
            <div className="space-y-3">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.id)}
                  className="w-full text-left bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {topic.author?.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {topic.is_pinned && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                            Epingle
                          </span>
                        )}
                        <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                          {topic.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-2">{topic.content}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{topic.author?.display_name || 'Anonyme'}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {getTimeAgo(topic.last_activity_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {topic.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {topic.reply_count}
                        </span>
                      </div>
                      {topic.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {topic.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={20} className="text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
              <MessageSquare size={48} className="text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Aucune discussion</h3>
              <p className="text-slate-400 mb-4">Soyez le premier a lancer une discussion !</p>
              <button className="text-emerald-400 hover:text-emerald-300 font-medium">
                Creer une discussion
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Statistiques
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Discussions</span>
                <span className="font-semibold text-white">{topics.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Contributions</span>
                <span className="font-semibold text-white">
                  {topics.reduce((sum, t) => sum + t.reply_count, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              Contributeurs actifs
            </h3>
            <div className="space-y-3">
              {topics
                .filter((t) => t.author)
                .slice(0, 5)
                .map((topic) => (
                  <div key={topic.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                      {topic.author?.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300">{topic.author?.display_name}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
