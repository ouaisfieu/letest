import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Lock,
  Unlock,
  Star,
  Zap,
  Trophy,
  Crown,
  Circle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SkillTreeNode, UserSkillNode, LearningPath } from '../../types';

interface SkillTreePageProps {
  onNavigateToPath: (pathId: string) => void;
}

const nodeIcons: Record<string, typeof Circle> = {
  root: Sparkles,
  skill: Circle,
  milestone: Star,
  mastery: Crown,
};

const nodeColors: Record<string, string> = {
  root: 'from-emerald-500 to-teal-500',
  skill: 'from-blue-500 to-cyan-500',
  milestone: 'from-amber-500 to-orange-500',
  mastery: 'from-rose-500 to-pink-500',
};

export function SkillTreePage({ onNavigateToPath }: SkillTreePageProps) {
  const { profile } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [nodes, setNodes] = useState<SkillTreeNode[]>([]);
  const [unlockedNodes, setUnlockedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<SkillTreeNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaths();
  }, []);

  useEffect(() => {
    if (selectedPath) {
      loadSkillTree(selectedPath);
    }
  }, [selectedPath, profile]);

  async function loadPaths() {
    const { data } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('is_published', true)
      .order('order_index');

    if (data) {
      setPaths(data);
      if (data.length > 0) {
        setSelectedPath(data[0].id);
      }
    }
    setLoading(false);
  }

  async function loadSkillTree(pathId: string) {
    const [nodesResult, unlockedResult] = await Promise.all([
      supabase
        .from('skill_tree_nodes')
        .select('*')
        .eq('learning_path_id', pathId)
        .eq('is_active', true)
        .order('position_y')
        .order('position_x'),
      profile
        ? supabase
            .from('user_skill_nodes')
            .select('node_id')
            .eq('user_id', profile.id)
        : Promise.resolve({ data: null }),
    ]);

    if (nodesResult.data) {
      setNodes(nodesResult.data);
    }
    if (unlockedResult.data) {
      setUnlockedNodes(new Set(unlockedResult.data.map((n: { node_id: string }) => n.node_id)));
    }
  }

  async function unlockNode(node: SkillTreeNode) {
    if (!profile || !canUnlock(node)) return;

    await supabase.from('user_skill_nodes').insert({
      user_id: profile.id,
      node_id: node.id,
      xp_spent: node.xp_cost,
    });

    setUnlockedNodes((prev) => new Set([...prev, node.id]));
    setSelectedNode(null);
  }

  function canUnlock(node: SkillTreeNode): boolean {
    if (unlockedNodes.has(node.id)) return false;
    if (node.node_type === 'root') return true;
    if (!node.parent_node_id) return true;
    return unlockedNodes.has(node.parent_node_id);
  }

  function isUnlocked(nodeId: string): boolean {
    return unlockedNodes.has(nodeId);
  }

  function getNodePosition(node: SkillTreeNode) {
    const baseX = 50;
    const baseY = 10;
    const spacingX = 25;
    const spacingY = 18;
    return {
      x: baseX + node.position_x * spacingX,
      y: baseY + node.position_y * spacingY,
    };
  }

  function renderConnections() {
    const connections: JSX.Element[] = [];
    nodes.forEach((node) => {
      if (node.parent_node_id) {
        const parent = nodes.find((n) => n.id === node.parent_node_id);
        if (parent) {
          const from = getNodePosition(parent);
          const to = getNodePosition(node);
          const isActive = isUnlocked(parent.id);
          connections.push(
            <line
              key={`${parent.id}-${node.id}`}
              x1={`${from.x}%`}
              y1={`${from.y + 4}%`}
              x2={`${to.x}%`}
              y2={`${to.y - 2}%`}
              stroke={isActive ? '#14b8a6' : '#334155'}
              strokeWidth="2"
              strokeDasharray={isActive ? '0' : '5,5'}
            />
          );
        }
      }
    });
    return connections;
  }

  const currentPath = paths.find((p) => p.id === selectedPath);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-2">Arbre de Competences</h1>
        <p className="text-slate-400">
          Debloquez des competences en progressant dans vos parcours.
          Chaque noeud vous rapproche de la maitrise.
        </p>

        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {paths.map((path) => (
            <button
              key={path.id}
              onClick={() => setSelectedPath(path.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedPath === path.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {path.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 min-h-[500px] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" />

            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
              {renderConnections()}
            </svg>

            <div className="relative" style={{ zIndex: 2 }}>
              {nodes.map((node) => {
                const pos = getNodePosition(node);
                const unlocked = isUnlocked(node.id);
                const available = canUnlock(node);
                const Icon = nodeIcons[node.node_type] || Circle;
                const gradient = nodeColors[node.node_type] || nodeColors.skill;

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                      unlocked
                        ? 'scale-100'
                        : available
                        ? 'scale-90 hover:scale-100'
                        : 'scale-75 opacity-50'
                    }`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                        unlocked
                          ? `bg-gradient-to-br ${gradient} border-white/30 shadow-lg shadow-teal-500/30`
                          : available
                          ? 'bg-slate-700 border-slate-500 hover:border-teal-500'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      {unlocked ? (
                        <Icon size={24} className="text-white" />
                      ) : available ? (
                        <Unlock size={20} className="text-slate-300" />
                      ) : (
                        <Lock size={18} className="text-slate-500" />
                      )}
                    </div>
                    <p
                      className={`mt-1 text-xs text-center max-w-20 truncate ${
                        unlocked ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {node.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {currentPath && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-2">{currentPath.title}</h3>
              <p className="text-sm text-slate-400 mb-3">{currentPath.description}</p>
              <button
                onClick={() => onNavigateToPath(currentPath.id)}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-1"
              >
                Voir le parcours <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3">Legende</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(nodeIcons).map(([type, Icon]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${nodeColors[type]} flex items-center justify-center`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <span className="text-slate-300 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-2">Progression</h3>
            <div className="text-2xl font-bold text-teal-400">
              {unlockedNodes.size} / {nodes.length}
            </div>
            <div className="h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all"
                style={{ width: `${nodes.length ? (unlockedNodes.size / nodes.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedNode && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${nodeColors[selectedNode.node_type]} flex items-center justify-center`}>
                {isUnlocked(selectedNode.id) ? (
                  React.createElement(nodeIcons[selectedNode.node_type] || Circle, { size: 20, className: 'text-white' })
                ) : (
                  <Lock size={18} className="text-white" />
                )}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{selectedNode.title}</h2>
            <p className="text-slate-400 mb-4">{selectedNode.description}</p>

            <div className="flex items-center gap-4 text-sm mb-4">
              <span className="flex items-center gap-1 text-amber-400">
                <Zap size={14} />
                {selectedNode.xp_cost} XP requis
              </span>
              <span className="capitalize text-slate-500">{selectedNode.node_type}</span>
            </div>

            {isUnlocked(selectedNode.id) ? (
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 text-center">
                <p className="text-emerald-400 font-medium">Competence debloquee !</p>
              </div>
            ) : canUnlock(selectedNode) ? (
              <button
                onClick={() => unlockNode(selectedNode)}
                disabled={!profile || (profile.total_xp || 0) < selectedNode.xp_cost}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 rounded-xl text-white font-medium transition-all"
              >
                Debloquer ({selectedNode.xp_cost} XP)
              </button>
            ) : (
              <div className="bg-slate-700 rounded-lg p-3 text-center">
                <p className="text-slate-400 text-sm">
                  Debloquez d'abord les competences precedentes
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
