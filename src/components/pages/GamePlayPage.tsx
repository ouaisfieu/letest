import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { GameCollection, GameCard, GameType } from '../../types';
import { FlashcardGame } from '../games/FlashcardGame';
import { MCQGame } from '../games/MCQGame';
import { MatchingGame } from '../games/MatchingGame';
import { GameResults } from '../games/GameResults';
import { BreakModal } from '../wellness/BreakModal';
import { BlinkReminder } from '../wellness/BlinkReminder';
import { useBreakReminder } from '../../hooks/useBreakReminder';
import { useBlinkReminder } from '../../hooks/useBlinkReminder';

interface GamePlayPageProps {
  collectionId: string;
  onBack: () => void;
}

type GamePhase = 'loading' | 'playing' | 'results';

interface GameResultsData {
  cardsCorrect: number;
  cardsSeen: number;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  streak: number;
  xpEarned: number;
}

export function GamePlayPage({ collectionId, onBack }: GamePlayPageProps) {
  const { profile, updateProfile } = useAuth();
  const [collection, setCollection] = useState<GameCollection | null>(null);
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [results, setResults] = useState<GameResultsData | null>(null);
  const [gameMode] = useState<'practice' | 'timed' | 'challenge'>('practice');

  const breakReminder = useBreakReminder({
    microBreakInterval: 20 * 60,
    enabled: true,
    intensity: 'medium',
  });

  const blinkReminder = useBlinkReminder({
    interval: 25000,
    enabled: true,
  });

  useEffect(() => {
    async function loadGame() {
      const [collectionResult, cardsResult] = await Promise.all([
        supabase
          .from('game_collections')
          .select('*, game_types(*)')
          .eq('id', collectionId)
          .maybeSingle(),
        supabase
          .from('game_cards')
          .select('*')
          .eq('collection_id', collectionId)
          .eq('is_active', true)
          .order('order_index'),
      ]);

      if (collectionResult.data) {
        setCollection(collectionResult.data as GameCollection);
        setGameType(collectionResult.data.game_types as GameType);
      }

      if (cardsResult.data) {
        const shuffled = [...cardsResult.data].sort(() => Math.random() - 0.5);
        setCards(shuffled as GameCard[]);
      }

      setPhase('playing');
    }

    loadGame();
  }, [collectionId]);

  const handleGameComplete = useCallback(
    async (gameResults: {
      cardsCorrect: number;
      cardsSeen: number;
      score: number;
      maxScore: number;
      timeSpentSeconds: number;
      streak: number;
      responses: { cardId: string; correct: boolean; timeMs: number; hintUsed: boolean }[];
    }) => {
      if (!profile || !collection) return;

      const xpEarned = Math.floor(
        (gameResults.cardsCorrect / gameResults.cardsSeen) * collection.xp_reward
      );

      await supabase.from('game_sessions').insert({
        user_id: profile.id,
        collection_id: collectionId,
        game_mode: gameMode,
        completed_at: new Date().toISOString(),
        score: gameResults.score,
        max_score: gameResults.maxScore,
        cards_seen: gameResults.cardsSeen,
        cards_correct: gameResults.cardsCorrect,
        time_spent_seconds: gameResults.timeSpentSeconds,
        streak_count: gameResults.streak,
      });

      const newXP = (profile.total_xp || 0) + xpEarned;
      await updateProfile({ total_xp: newXP });

      setResults({
        ...gameResults,
        xpEarned,
      });
      setPhase('results');
      breakReminder.resetTimer();
    },
    [profile, collection, collectionId, gameMode, updateProfile, breakReminder]
  );

  const handlePlayAgain = useCallback(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setResults(null);
    setPhase('playing');
  }, [cards]);

  const handleBreakComplete = useCallback(() => {
    breakReminder.takeBreak();
  }, [breakReminder]);

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === 'results' && results) {
    return (
      <div className="p-6">
        <GameResults
          results={results}
          collectionTitle={collection?.title || ''}
          onPlayAgain={handlePlayAgain}
          onExit={onBack}
        />
      </div>
    );
  }

  const renderGame = () => {
    if (!gameType || cards.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-400">Aucune carte disponible pour ce jeu</p>
          <button
            onClick={onBack}
            className="mt-4 text-emerald-400 hover:text-emerald-300"
          >
            Retour aux jeux
          </button>
        </div>
      );
    }

    switch (gameType.slug) {
      case 'flashcards':
        return (
          <FlashcardGame
            cards={cards}
            onComplete={handleGameComplete}
            onExit={onBack}
            mode={gameMode}
          />
        );
      case 'mcq':
        return (
          <MCQGame
            cards={cards}
            onComplete={handleGameComplete}
            onExit={onBack}
            mode={gameMode}
          />
        );
      case 'matching':
        return (
          <MatchingGame
            cards={cards}
            onComplete={handleGameComplete}
            onExit={onBack}
            mode={gameMode}
          />
        );
      default:
        return (
          <FlashcardGame
            cards={cards}
            onComplete={handleGameComplete}
            onExit={onBack}
            mode={gameMode}
          />
        );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {phase === 'playing' && (
        <>
          {renderGame()}

          {breakReminder.breakDue && breakReminder.breakType && (
            <BreakModal
              breakType={breakReminder.breakType}
              duration={breakReminder.breakDuration}
              onComplete={handleBreakComplete}
              onSkip={breakReminder.canSkip ? breakReminder.skipBreak : undefined}
              canSkip={breakReminder.canSkip}
              xpReward={breakReminder.breakType === 'micro' ? 5 : 15}
            />
          )}

          {blinkReminder.showReminder && (
            <BlinkReminder
              message={blinkReminder.message}
              onDismiss={blinkReminder.dismiss}
            />
          )}
        </>
      )}
    </div>
  );
}
