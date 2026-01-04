# Framework de Jeux Educatifs avec Bien-etre Numerique

## Specification Technique Complete

---

## Table des Matieres

1. [Vision et Principes](#1-vision-et-principes)
2. [Architecture des Donnees](#2-architecture-des-donnees)
3. [Systeme de Gestion de Contenu](#3-systeme-de-gestion-de-contenu)
4. [Mecaniques de Gamification](#4-mecaniques-de-gamification)
5. [Integration du Bien-etre Numerique](#5-integration-du-bien-etre-numerique)
6. [Implementation Technique](#6-implementation-technique)
7. [Feuille de Route](#7-feuille-de-route)

---

## 1. Vision et Principes

### 1.1 Philosophie du Design

**Engagement Durable vs Addiction Exploitative**

Notre approche repose sur trois piliers:
- **Autonomie**: L'utilisateur controle son experience
- **Competence**: Progression perceptible et valorisante
- **Relation**: Connexion avec une communaute bienveillante

### 1.2 Modele de Progression "Crescendo"

```
Niveau 1-5:   [====] Decouverte douce
Niveau 6-15:  [========] Engagement progressif
Niveau 16-30: [============] Maitrise approfondie
Niveau 31+:   [================] Excellence et mentorat
```

**Principes de la gamification ethique:**
- Recompenses intrinseques prioritaires (satisfaction d'apprendre)
- Rappels de pause integres naturellement
- Pas de mecaniques de FOMO (Fear Of Missing Out)
- Transparence sur le temps passe

---

## 2. Architecture des Donnees

### 2.1 Schema de Base de Donnees - Jeux Educatifs

```sql
-- Types de jeux disponibles
CREATE TABLE game_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  min_players integer DEFAULT 1,
  max_players integer DEFAULT 1,
  avg_duration_minutes integer DEFAULT 10,
  difficulty_range int4range DEFAULT '[1,5]',
  is_active boolean DEFAULT true
);

-- Collections de contenus (decks de cartes, plateaux, etc.)
CREATE TABLE game_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type_id uuid REFERENCES game_types(id),
  module_id uuid REFERENCES modules(id),
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  cover_image_url text,
  difficulty_level integer DEFAULT 1,
  estimated_minutes integer DEFAULT 15,
  xp_reward integer DEFAULT 50,
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_type_id, slug)
);

-- Cartes/Elements de jeu generiques
CREATE TABLE game_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES game_collections(id) ON DELETE CASCADE,
  card_type text NOT NULL DEFAULT 'question',
  front_content jsonb NOT NULL,
  back_content jsonb NOT NULL,
  hints jsonb DEFAULT '[]',
  tags text[] DEFAULT '{}',
  difficulty integer DEFAULT 1,
  points integer DEFAULT 10,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Sessions de jeu
CREATE TABLE game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES game_collections(id),
  game_mode text NOT NULL DEFAULT 'practice',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  score integer DEFAULT 0,
  max_score integer DEFAULT 0,
  cards_seen integer DEFAULT 0,
  cards_correct integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  streak_count integer DEFAULT 0,
  session_data jsonb DEFAULT '{}'
);

-- Historique des reponses par carte
CREATE TABLE card_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  card_id uuid REFERENCES game_cards(id),
  user_answer jsonb,
  is_correct boolean,
  response_time_ms integer,
  attempts integer DEFAULT 1,
  answered_at timestamptz DEFAULT now()
);

-- Maitrise des cartes (algorithme de repetition espacee)
CREATE TABLE card_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  card_id uuid REFERENCES game_cards(id),
  ease_factor numeric DEFAULT 2.5,
  interval_days integer DEFAULT 1,
  repetitions integer DEFAULT 0,
  next_review_date date DEFAULT CURRENT_DATE,
  last_reviewed_at timestamptz,
  mastery_level integer DEFAULT 0,
  UNIQUE(user_id, card_id)
);
```

### 2.2 Formats de Contenu par Type de Jeu

#### 2.2.1 Flashcards (Question/Reponse)

```json
{
  "card_type": "flashcard",
  "front_content": {
    "type": "question",
    "text": "Quel systeme politique est caracterise par l'exercice direct du pouvoir par les citoyens?",
    "media": null,
    "formatting": "markdown"
  },
  "back_content": {
    "type": "answer",
    "text": "La democratie directe",
    "explanation": "Contrairement a la democratie representative...",
    "sources": ["Manuel d'education civique, p.45"]
  },
  "hints": [
    "Pensez a la Grece antique",
    "Les citoyens votent eux-memes les lois"
  ],
  "tags": ["democratie", "politique", "fondamentaux"],
  "difficulty": 2
}
```

#### 2.2.2 QCM Interactif

```json
{
  "card_type": "mcq",
  "front_content": {
    "type": "question",
    "text": "Qu'est-ce que la pilarisation en Belgique?",
    "options": [
      "Une technique de construction",
      "La division de la societe en mondes ideologiques distincts",
      "Un systeme electoral",
      "Une forme de gouvernement"
    ],
    "correct_indices": [1],
    "shuffle_options": true
  },
  "back_content": {
    "type": "explanation",
    "text": "La pilarisation designe la division de la societe belge en piliers catholique, liberal et socialiste.",
    "learn_more_url": "/lessons/pilarisation"
  }
}
```

#### 2.2.3 Association/Matching

```json
{
  "card_type": "matching",
  "front_content": {
    "type": "pairs",
    "instruction": "Associez chaque concept a sa definition",
    "left_items": [
      {"id": "a", "text": "Unionisme"},
      {"id": "b", "text": "Pacte scolaire"},
      {"id": "c", "text": "Consociationalisme"}
    ],
    "right_items": [
      {"id": "1", "text": "Accord de 1958 sur l'enseignement"},
      {"id": "2", "text": "Rapprochement catholiques-liberaux"},
      {"id": "3", "text": "Modele de partage du pouvoir"}
    ],
    "correct_pairs": {"a": "2", "b": "1", "c": "3"}
  }
}
```

#### 2.2.4 Carte de Connaissance (Knowledge Graph)

```json
{
  "card_type": "entity",
  "front_content": {
    "type": "entity_card",
    "entity": {
      "id": "frodo",
      "name": "Frodon Sacquet",
      "type": "person",
      "image_url": "/images/frodo.jpg",
      "brief": "Porteur de l'Anneau Unique"
    },
    "question": "Quel est le role de ce personnage dans la quete?"
  },
  "back_content": {
    "relations": [
      {"type": "porteur de", "target": "Anneau Unique"},
      {"type": "neveu de", "target": "Bilbon"},
      {"type": "ami de", "target": "Samsagace"}
    ],
    "full_description": "Hobbit de la Comte, neveu et heritier de Bilbon..."
  }
}
```

#### 2.2.5 Scenario Interactif

```json
{
  "card_type": "scenario",
  "front_content": {
    "type": "situation",
    "context": "Vous etes benevole dans une association locale...",
    "scenario": "Le tresorier vous demande d'approuver une depense importante sans justificatif.",
    "choices": [
      {
        "id": "a",
        "text": "Approuver pour ne pas creer de conflit",
        "consequence": "negative",
        "feedback": "Cette decision pourrait engager votre responsabilite..."
      },
      {
        "id": "b",
        "text": "Demander le justificatif avant d'approuver",
        "consequence": "positive",
        "feedback": "Bonne pratique de gouvernance associative!"
      }
    ]
  }
}
```

### 2.3 Import/Export de Donnees

#### Format CSV pour Flashcards
```csv
question,answer,hints,tags,difficulty
"Qu'est-ce que l'IE?","L'intelligence economique...","Pensez strategique|Information","veille,strategie",2
```

#### Format JSON pour Collections Completes
```json
{
  "collection": {
    "title": "Fondamentaux de la Politique Belge",
    "description": "...",
    "game_type": "flashcards"
  },
  "cards": [...]
}
```

---

## 3. Systeme de Gestion de Contenu

### 3.1 Interface d'Administration Non-Technique

```
+----------------------------------------------------------+
|  EDITEUR DE CONTENU - Flashcards Politique               |
+----------------------------------------------------------+
|  [+ Nouvelle Carte]  [Importer CSV]  [Exporter]          |
+----------------------------------------------------------+
|                                                           |
|  Question:                                                |
|  +------------------------------------------------------+|
|  | Quel systeme politique...                            ||
|  +------------------------------------------------------+|
|                                                           |
|  Reponse:                                                 |
|  +------------------------------------------------------+|
|  | La democratie directe                                ||
|  +------------------------------------------------------+|
|                                                           |
|  Indices (optionnel):                                     |
|  [Grece antique] [+]                                      |
|                                                           |
|  Difficulte: [*][*][*][ ][ ]                              |
|                                                           |
|  Tags: [democratie] [politique] [+]                       |
|                                                           |
|  [Previsualiser]  [Sauvegarder]  [Supprimer]             |
+----------------------------------------------------------+
```

### 3.2 Workflow de Publication

```
BROUILLON --> EN REVISION --> PUBLIE
    |              |             |
    v              v             v
 Createur      Relecteur     Visible
 modifie       valide        aux users
```

### 3.3 Versioning du Contenu

```sql
CREATE TABLE content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES game_cards(id),
  version_number integer NOT NULL,
  content_snapshot jsonb NOT NULL,
  changed_by uuid REFERENCES user_profiles(id),
  change_reason text,
  created_at timestamptz DEFAULT now()
);
```

---

## 4. Mecaniques de Gamification

### 4.1 Jeux de Cartes Progressifs

#### 4.1.1 Mode Decouverte (Niveau 1-5)
- Presentation simple question/reponse
- Pas de chronometre
- Indices disponibles immediatement
- Feedback encourageant systematique

#### 4.1.2 Mode Entrainement (Niveau 6-15)
- Chronometre optionnel
- Systeme de combo pour reponses consecutives
- Indices avec penalite de points
- Statistiques de progression

#### 4.1.3 Mode Defi (Niveau 16-30)
- Sessions chronometrees
- Mode survie (3 vies)
- Cartes bonus et malus
- Classement entre pairs

#### 4.1.4 Mode Expert (Niveau 31+)
- Creation de contenu par les utilisateurs
- Defis communautaires
- Mentorat des nouveaux

### 4.2 Plateaux et Grilles Interactifs

#### 4.2.1 Grille de Connaissances

```
+---+---+---+---+---+
| V | A | R | S | C |  <- Categories (Veille, Analyse, Reseau...)
+---+---+---+---+---+
|100|100|100|100|100|  <- Points par difficulte
+---+---+---+---+---+
|200|200|200|200|200|
+---+---+---+---+---+
|300|300|300|300|300|
+---+---+---+---+---+
```

Inspiree du Jeopardy, chaque case revele une question.

#### 4.2.2 Parcours Narratif

```
[Depart] --> [?] --> [?] --> [Boss] --> [Checkpoint]
                |
                v
            [Bonus]
```

L'utilisateur avance sur un chemin, chaque case = une question.

#### 4.2.3 Carte Mentale Interactive

```
                    [Concept Central]
                    /       |       \
                   /        |        \
            [Sous-1]   [Sous-2]   [Sous-3]
             /    \       |         |
          [A]    [B]    [C]      [D]
```

Explorer et completer une carte de connaissances.

### 4.3 Micro-apprentissage Modal

#### Sessions de 5 minutes
- 5-7 cartes par session
- Focus sur une competence
- Rappel a moment optimal (notification intelligente)

#### Structure d'une Micro-session

```
1. Introduction (30s)
   "Aujourd'hui: 5 questions sur la veille strategique"

2. Questions (3-4min)
   [Carte 1] -> [Carte 2] -> ... -> [Carte 5]

3. Synthese (30s)
   "Bravo! 4/5 - Points cles a retenir..."

4. Proposition de suite
   "Continuer?" / "Pause recommandee"
```

### 4.4 Systeme de Recompenses

#### 4.4.1 XP et Niveaux

```javascript
// Formule de niveau
level = Math.floor(Math.sqrt(totalXP / 100)) + 1;

// XP gagne par action
const XP_REWARDS = {
  card_correct: 10,
  card_correct_first_try: 15,
  card_correct_streak_5: 25,
  session_complete: 50,
  perfect_session: 100,
  daily_goal: 30,
  weekly_streak: 150
};
```

#### 4.4.2 Badges Progressifs

| Badge | Condition | Rarete |
|-------|-----------|--------|
| Premier Pas | 1ere carte correcte | Commun |
| Etudiant | 50 cartes correctes | Commun |
| Assidu | 7 jours consecutifs | Rare |
| Perfectionniste | 10 sessions parfaites | Epique |
| Maitre | 1000 cartes maitrisees | Legendaire |

#### 4.4.3 Deblocables Cosmetiques

- Themes de couleur pour l'interface
- Avatars et accessoires
- Animations de celebration
- Sons de notification personnalises

### 4.5 Algorithme de Repetition Espacee (SRS)

```javascript
// Implementation SM-2 simplifiee
function updateCardMastery(card, quality) {
  // quality: 0-5 (0=echec total, 5=parfait)

  if (quality < 3) {
    // Echec: recommencer
    card.repetitions = 0;
    card.interval = 1;
  } else {
    // Succes: augmenter l'intervalle
    if (card.repetitions === 0) {
      card.interval = 1;
    } else if (card.repetitions === 1) {
      card.interval = 6;
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }
    card.repetitions++;
  }

  // Ajuster le facteur de facilite
  card.easeFactor = Math.max(1.3,
    card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  card.nextReviewDate = addDays(today, card.interval);

  return card;
}
```

---

## 5. Integration du Bien-etre Numerique

### 5.1 Prevention de la Fatigue Oculaire

#### 5.1.1 Rappel de Clignement

```javascript
// Toutes les 20 secondes de lecture intensive
const BlinkReminder = {
  interval: 20000, // 20 secondes
  duration: 3000,  // 3 secondes d'affichage

  messages: [
    "Clignez des yeux doucement",
    "Prenez une respiration profonde",
    "Detendez vos epaules"
  ]
};
```

**Implementation UI:**
```
+----------------------------------+
|     [Animation oeil qui cligne]  |
|                                  |
|     Clignez doucement            |
|     les yeux 3 fois              |
|                                  |
|     [Fait!]                      |
+----------------------------------+
```

#### 5.1.2 Regle 20-20-20

Toutes les 20 minutes: regarder quelque chose a 20 pieds (6m) pendant 20 secondes.

```javascript
const TwentyTwentyRule = {
  workInterval: 20 * 60 * 1000, // 20 minutes
  breakDuration: 20 * 1000,     // 20 secondes

  trigger: () => {
    showModal({
      title: "Pause pour vos yeux",
      content: "Regardez par la fenetre ou un point eloigne pendant 20 secondes",
      timer: 20,
      skippable: false,
      xpBonus: 5
    });
  }
};
```

### 5.2 Systeme de Pauses Obligatoires

#### 5.2.1 Micro-pauses (toutes les 15-20 min)

```
+------------------------------------------+
|  MICRO-PAUSE (20 secondes)               |
+------------------------------------------+
|                                          |
|     [Illustration: personne etirant]     |
|                                          |
|     Etirez vos bras au-dessus           |
|     de votre tete                        |
|                                          |
|     Temps restant: 0:15                  |
|                                          |
|     +5 XP pour cette pause!              |
+------------------------------------------+
```

#### 5.2.2 Pauses Moyennes (toutes les 45-60 min)

```javascript
const MediumBreak = {
  interval: 45 * 60 * 1000,
  duration: 5 * 60 * 1000, // 5 minutes

  activities: [
    {
      name: "Marche courte",
      instruction: "Faites quelques pas dans la piece",
      duration: 120
    },
    {
      name: "Hydratation",
      instruction: "Buvez un verre d'eau",
      duration: 60
    },
    {
      name: "Etirements",
      instruction: "Suivez ces 3 etirements simples",
      duration: 180,
      steps: ["Nuque", "Epaules", "Dos"]
    }
  ]
};
```

#### 5.2.3 Pause Longue (apres 90-120 min)

```
+------------------------------------------+
|  TEMPS DE PAUSE RECOMMANDE               |
+------------------------------------------+
|                                          |
|  Vous apprenez depuis 1h30               |
|                                          |
|  Votre cerveau a besoin de consolider    |
|  ces nouvelles connaissances!            |
|                                          |
|  Suggestion: Pause de 15-20 minutes      |
|                                          |
|  [Continuer 10 min] [Prendre la pause]   |
|                                          |
|  Note: "Continuer" limite a 1 fois       |
+------------------------------------------+
```

### 5.3 Sensibilisation a l'Economie de l'Attention

#### 5.3.1 Module Educatif Integre

```javascript
const AttentionAwarenessModule = {
  lessons: [
    {
      id: "attention-1",
      title: "Comment fonctionne votre attention",
      duration: 5,
      keyPoints: [
        "L'attention est une ressource limitee",
        "Le multitache est un mythe",
        "Les notifications fragmentent la concentration"
      ]
    },
    {
      id: "attention-2",
      title: "Les techniques de capture d'attention",
      duration: 7,
      keyPoints: [
        "Boucles de dopamine",
        "Scroll infini",
        "Notifications push",
        "Metriques de vanite"
      ]
    },
    {
      id: "attention-3",
      title: "Reprendre le controle",
      duration: 8,
      keyPoints: [
        "Mode focus",
        "Temps d'ecran intentionnel",
        "Hygiene numerique"
      ]
    }
  ]
};
```

#### 5.3.2 Indicateurs de Temps

```
+------------------------------------------+
|  VOTRE ACTIVITE AUJOURD'HUI              |
+------------------------------------------+
|                                          |
|  Temps d'apprentissage: 45 min           |
|  ==========[========]     (sur 60 min)   |
|                                          |
|  Sessions: 3                             |
|  Pauses prises: 2/2 recommandees         |
|                                          |
|  Cette semaine:                          |
|  L  M  M  J  V  S  D                     |
|  ## ## ## .. .. .. ..                    |
|  45 30 45                                |
|                                          |
+------------------------------------------+
```

### 5.4 Limites Configurables

```javascript
const WellnessSettings = {
  dailyGoal: {
    min: 15,      // minutes
    default: 45,
    max: 120
  },

  sessionLimit: {
    min: 10,
    default: 30,
    max: 60
  },

  breakReminders: {
    enabled: true,
    intensity: 'medium', // 'gentle', 'medium', 'strict'
    canSkip: true,
    maxSkips: 1
  },

  nightMode: {
    enabled: true,
    startTime: '21:00',
    endTime: '07:00',
    reducedNotifications: true
  },

  weeklyReport: {
    enabled: true,
    sendDay: 'sunday',
    includeInsights: true
  }
};
```

### 5.5 Gamification du Bien-etre

#### Badges de Bien-etre

| Badge | Condition |
|-------|-----------|
| Equilibre | 7 jours sous la limite quotidienne |
| Zen | 100% des pauses prises sur une semaine |
| Early Bird | 10 sessions avant 9h |
| Night Owl Sage | Respecte le mode nuit 30 jours |

#### XP Bonus Bien-etre

```javascript
const WellnessXP = {
  pauseTaken: 5,
  dailyGoalRespected: 20,
  blinkExercise: 2,
  stretchBreak: 10,
  hydrationReminder: 3,
  weeklyBalanced: 50
};
```

---

## 6. Implementation Technique

### 6.1 Architecture Modulaire

```
src/
├── games/
│   ├── engine/
│   │   ├── GameEngine.ts         # Moteur principal
│   │   ├── CardRenderer.ts       # Rendu des cartes
│   │   ├── ScoreManager.ts       # Gestion des scores
│   │   ├── SRSAlgorithm.ts       # Repetition espacee
│   │   └── SessionManager.ts     # Gestion des sessions
│   │
│   ├── types/
│   │   ├── flashcards/
│   │   ├── matching/
│   │   ├── scenarios/
│   │   └── board/
│   │
│   └── components/
│       ├── GameContainer.tsx
│       ├── CardDisplay.tsx
│       ├── ProgressBar.tsx
│       ├── ScoreDisplay.tsx
│       └── ResultsScreen.tsx
│
├── wellness/
│   ├── hooks/
│   │   ├── useSessionTimer.ts
│   │   ├── useBreakReminder.ts
│   │   └── useBlinkReminder.ts
│   │
│   ├── components/
│   │   ├── BreakModal.tsx
│   │   ├── BlinkReminder.tsx
│   │   ├── TimeTracker.tsx
│   │   └── WellnessReport.tsx
│   │
│   └── services/
│       ├── WellnessSettings.ts
│       └── ActivityTracker.ts
│
└── cms/
    ├── ContentEditor.tsx
    ├── CSVImporter.tsx
    ├── CollectionManager.tsx
    └── PublishWorkflow.tsx
```

### 6.2 Hooks de Bien-etre

```typescript
// useBreakReminder.ts
export function useBreakReminder(config: BreakConfig) {
  const [activeTime, setActiveTime] = useState(0);
  const [breakDue, setBreakDue] = useState(false);
  const [breaksTaken, setBreaksTaken] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        setActiveTime(prev => {
          const newTime = prev + 1;
          if (newTime >= config.interval && !breakDue) {
            setBreakDue(true);
          }
          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config.interval, breakDue]);

  const takeBreak = () => {
    setBreakDue(false);
    setActiveTime(0);
    setBreaksTaken(prev => prev + 1);
  };

  return { activeTime, breakDue, breaksTaken, takeBreak };
}
```

### 6.3 API de Contenu

```typescript
// Endpoints principaux
const ContentAPI = {
  // Collections
  getCollections: (filters?: CollectionFilters) =>
    supabase.from('game_collections').select('*').match(filters),

  // Cartes avec maitrise utilisateur
  getCardsWithMastery: (collectionId: string, userId: string) =>
    supabase.rpc('get_cards_with_mastery', {
      p_collection_id: collectionId,
      p_user_id: userId
    }),

  // Cartes a reviser (SRS)
  getDueCards: (userId: string, limit: number = 20) =>
    supabase.rpc('get_due_cards', {
      p_user_id: userId,
      p_limit: limit
    }),

  // Sauvegarder reponse
  saveResponse: (response: CardResponse) =>
    supabase.from('card_responses').insert(response),

  // Mettre a jour maitrise
  updateMastery: (userId: string, cardId: string, quality: number) =>
    supabase.rpc('update_card_mastery', {
      p_user_id: userId,
      p_card_id: cardId,
      p_quality: quality
    })
};
```

### 6.4 Analytics Respectueux

```typescript
// Donnees collectees (anonymisees)
interface LearningAnalytics {
  // Agregees, pas individuelles
  totalSessionsToday: number;
  averageSessionDuration: number;
  cardsReviewedCount: number;
  correctAnswerRate: number;

  // Bien-etre (optionnel, opt-in)
  breaksTaken: number;
  screenTimeMinutes: number;
  peakLearningHours: number[];

  // Jamais collecte
  // - Contenu des reponses libres
  // - Donnees de localisation
  // - Identifiants tiers
}

// Politique de retention
const DataRetention = {
  sessionDetails: '30 days',
  aggregatedStats: '1 year',
  wellnessData: 'user-controlled',
  exportAvailable: true,
  deleteOnRequest: true
};
```

---

## 7. Feuille de Route

### Phase 1: Fondations (Semaines 1-4)

- [ ] Schema de base de donnees pour les jeux
- [ ] Moteur de jeu de cartes basique
- [ ] Import CSV de flashcards
- [ ] Interface de jeu simple
- [ ] Systeme XP de base

### Phase 2: Gamification (Semaines 5-8)

- [ ] Algorithme SRS complet
- [ ] Modes de jeu varies (chrono, survie)
- [ ] Systeme de badges
- [ ] Tableaux de progression
- [ ] Statistiques personnelles

### Phase 3: Bien-etre (Semaines 9-12)

- [ ] Rappels de pause
- [ ] Exercices oculaires
- [ ] Suivi du temps d'ecran
- [ ] Module sensibilisation attention
- [ ] Rapport hebdomadaire

### Phase 4: CMS & Contenu (Semaines 13-16)

- [ ] Interface d'edition non-technique
- [ ] Workflow de publication
- [ ] Versioning du contenu
- [ ] Import/export avance
- [ ] Templates de collections

### Phase 5: Social & Communaute (Semaines 17-20)

- [ ] Defis entre pairs
- [ ] Creation de contenu utilisateur
- [ ] Partage de collections
- [ ] Mentorat
- [ ] Classements optionnels

---

## Annexes

### A. Exemples de Donnees

#### A.1 Collection "Politique Belge"
Basee sur le fichier `flashcards_(3).csv` fourni:
- 64 cartes question/reponse
- Thematiques: democratie, institutions, histoire
- Difficulte: 1-3

#### A.2 Collection "Reseau Associatif"
Basee sur `repertoirecoordonneesaep_site_21-10-25.csv`:
- Annuaire interactif
- Quiz sur les organisations
- Jeu d'association thematique

#### A.3 Dataset Narratif "Terre du Milieu"
Base sur `lotr-dataset.json`:
- Cartes de personnages (40+)
- Relations entre entites
- Quiz sur l'univers
- Parcours narratif interactif

### B. Metriques de Succes

| Metrique | Objectif | Mesure |
|----------|----------|--------|
| Retention J7 | >40% | Users actifs 7 jours apres inscription |
| Sessions/semaine | >3 | Moyenne par utilisateur actif |
| Taux completion | >60% | Sessions terminees normalement |
| Pauses prises | >80% | Pauses recommandees effectuees |
| Satisfaction | >4/5 | Score moyen feedback |

### C. Accessibilite

- Contraste minimum WCAG AA
- Navigation clavier complete
- Lecteur d'ecran compatible
- Mode daltonien
- Taille de texte ajustable
- Animations desactivables
