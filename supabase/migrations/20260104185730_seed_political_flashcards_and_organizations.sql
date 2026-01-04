/*
  # Import Political Flashcards and Organization Data
  
  1. Content Added
    - 64 political flashcards about Belgian democracy and governance
    - Organization directory collection for association knowledge game
    - Scenario collection with agent-based roleplay cards

  2. Topics Covered
    - Belgian political system fundamentals
    - Democratic concepts and vocabulary
    - Civil society organizations
    - Intelligence and strategic thinking scenarios
*/

DO $$
DECLARE
  v_flashcard_type_id uuid;
  v_mcq_type_id uuid;
  v_matching_type_id uuid;
  v_scenario_type_id uuid;
  v_collection_id uuid;
BEGIN
  SELECT id INTO v_flashcard_type_id FROM game_types WHERE slug = 'flashcards';
  SELECT id INTO v_mcq_type_id FROM game_types WHERE slug = 'mcq';
  SELECT id INTO v_matching_type_id FROM game_types WHERE slug = 'matching';
  SELECT id INTO v_scenario_type_id FROM game_types WHERE slug = 'scenario';

  -- Collection: Politique Belge Flashcards
  INSERT INTO game_collections (id, game_type_id, slug, title, description, difficulty_level, estimated_minutes, xp_reward, order_index)
  VALUES (
    gen_random_uuid(),
    v_flashcard_type_id,
    'politique-belge',
    'Vocabulaire Politique Belge',
    'Maitrisez les concepts cles de l''histoire et de la politique belges. Du consociationalisme a la pilarisation.',
    2,
    25,
    200,
    10
  )
  RETURNING id INTO v_collection_id;

  INSERT INTO game_cards (collection_id, card_type, front_content, back_content, hints, tags, difficulty, points, order_index) VALUES
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Quel systeme politique est caracterise par l''exercice direct du pouvoir par les citoyens, sans representants?"}',
    '{"type": "answer", "text": "La democratie directe", "explanation": "Contrairement a la democratie representative ou les citoyens elisent des representants."}',
    '["Pensez a la Grece antique", "Les citoyens votent eux-memes les lois"]',
    '{"democratie", "politique", "fondamentaux"}', 1, 10, 1),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Que sont les lobbies, ou groupes de pression?"}',
    '{"type": "answer", "text": "Des organisations cherchant a influencer les institutions politiques en defendant des interets publics ou prives."}',
    '["Influence politique", "Defense d''interets"]',
    '{"lobbying", "influence", "institutions"}', 2, 15, 2),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "En Belgique, quel type de scrutin est utilise pour repartir les sieges au parlement?"}',
    '{"type": "answer", "text": "Le scrutin proportionnel plurinominal", "explanation": "Chaque parti obtient un nombre de sieges proportionnel aux voix recues."}',
    '["Proportionnalite", "Representation fidele"]',
    '{"elections", "belgique", "scrutin"}', 2, 15, 3),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce que la pilarisation (verzuiling)?"}',
    '{"type": "answer", "text": "La division de la societe belge en mondes sociologiques distincts (catholique, liberal, socialiste) qui encadrent la vie des individus.", "explanation": "Ce systeme structure les reseaux: partis, syndicats, mutuelles, ecoles."}',
    '["Du berceau a la tombe", "Trois piliers historiques"]',
    '{"pilarisation", "belgique", "societe"}', 3, 20, 4),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce que le consociationalisme?"}',
    '{"type": "answer", "text": "Un modele de democratie adapte aux societes divisees, reposant sur le partage du pouvoir entre elites et la recherche de consensus.", "explanation": "Reste tres vivace en Belgique avec les grandes coalitions."}',
    '["Democratie de consensus", "Partage du pouvoir"]',
    '{"consociationalisme", "democratie", "belgique"}', 3, 20, 5),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce que l''unionisme belge?"}',
    '{"type": "answer", "text": "Un mouvement politique (1827-1846) marquant le rapprochement des catholiques et liberaux pour defendre les interets nationaux.", "explanation": "A pose les fondations de la culture du compromis belge."}',
    '["Catholiques + Liberaux", "Periode post-independance"]',
    '{"unionisme", "histoire", "belgique"}', 2, 15, 6),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce que le Pacte scolaire de 1958?"}',
    '{"type": "answer", "text": "Un accord majeur entre les trois grands partis (social-chretien, liberal, socialiste) pour mettre fin a la guerre scolaire.", "explanation": "Il concerne l''organisation et le financement de l''enseignement."}',
    '["1958", "Fin de la guerre scolaire"]',
    '{"pacte-scolaire", "education", "compromis"}', 2, 15, 7),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Quel principe fondamental assure que le pouvoir des institutions est limite par le droit?"}',
    '{"type": "answer", "text": "L''Etat de droit", "explanation": "Les institutions politiques sont limitees par des principes constitutionnels."}',
    '["Limite au pouvoir", "Constitution"]',
    '{"etat-droit", "democratie", "principes"}', 1, 10, 8),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Comment nomme-t-on le systeme allemand de participation des salaries aux conseils d''entreprises?"}',
    '{"type": "answer", "text": "La codetermination", "explanation": "Les salaries participent aux conseils de surveillance ou d''administration."}',
    '["Participation salariee", "Modele allemand"]',
    '{"codetermination", "entreprise", "social"}', 2, 15, 9),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce que la societe civile selon la pensee politique?"}',
    '{"type": "answer", "text": "L''ensemble des organisations independantes des instances publiques, a but non lucratif, qui interviennent dans le debat public."}',
    '["Non-gouvernemental", "Debat public"]',
    '{"societe-civile", "associations", "debat"}', 2, 15, 10),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Que sont les bulles de filtrage dans le contexte de l''information?"}',
    '{"type": "answer", "text": "Des espaces ou les citoyens sont principalement exposes a des points de vue similaires aux leurs, polarisant les opinions."}',
    '["Reseaux sociaux", "Echo chambers"]',
    '{"bulles-filtrage", "information", "polarisation"}', 2, 15, 11),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "En quelle annee le suffrage universel a-t-il ete elargi aux femmes en Belgique?"}',
    '{"type": "answer", "text": "En 1948", "explanation": "Les femmes belges ont obtenu le droit de vote pour toutes les elections en 1948."}',
    '["Apres la Seconde Guerre mondiale"]',
    '{"suffrage", "femmes", "histoire"}', 1, 10, 12),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce qu''une interpellation parlementaire?"}',
    '{"type": "answer", "text": "Un mecanisme permettant aux elus de questionner les ministres sur leur politique, se terminant par un vote."}',
    '["Controle parlementaire", "Questions aux ministres"]',
    '{"interpellation", "parlement", "controle"}', 2, 15, 13),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce qu''un sophisme de l''epouvantail (homme de paille)?"}',
    '{"type": "answer", "text": "Une technique qui consiste a deformer ou caricaturer la position de l''adversaire pour la refuter plus facilement."}',
    '["Argumentation fallacieuse", "Deformation"]',
    '{"sophisme", "argumentation", "rhetorique"}', 2, 15, 14),
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce que la palabre africaine dans les democraties traditionnelles?"}',
    '{"type": "answer", "text": "Un long debat visant a atteindre une unanimite consciente et reflechie (consensus) au sein de la communaute."}',
    '["Consensus", "Deliberation collective"]',
    '{"palabre", "afrique", "consensus"}', 2, 15, 15);

  -- Collection: Quiz Associations Belges
  INSERT INTO game_collections (id, game_type_id, slug, title, description, difficulty_level, estimated_minutes, xp_reward, order_index)
  VALUES (
    gen_random_uuid(),
    v_mcq_type_id,
    'associations-belges',
    'Connaitre les Associations Belges',
    'Testez vos connaissances sur les associations d''education permanente en Belgique francophone.',
    2,
    15,
    120,
    11
  )
  RETURNING id INTO v_collection_id;

  INSERT INTO game_cards (collection_id, card_type, front_content, back_content, hints, tags, difficulty, points, order_index) VALUES
  (v_collection_id, 'mcq',
    '{"type": "question", "text": "Quelle association est connue pour la defense des droits des etrangers en Belgique?", "options": ["ADDE (Association pour le Droit des Etrangers)", "CAL (Centre d''Action laique)", "CRISP", "FTU"], "correct_indices": [0], "shuffle_options": true}',
    '{"type": "explanation", "text": "L''ADDE (Association pour le Droit des Etrangers) est specialisee dans l''aide juridique aux etrangers."}',
    '[]', '{"associations", "droits", "quiz"}', 2, 15, 1),
  (v_collection_id, 'mcq',
    '{"type": "question", "text": "Que signifie CRISP?", "options": ["Centre de Recherche et d''Information socio-politiques", "Comite Regional d''Insertion Sociale et Professionnelle", "Centre Regional d''Innovation et de Strategie Publique", "Collectif de Recherche sur les Inegalites Sociales et Politiques"], "correct_indices": [0], "shuffle_options": true}',
    '{"type": "explanation", "text": "Le CRISP est un centre de recherche independant analysant la vie politique belge depuis 1959."}',
    '[]', '{"crisp", "recherche", "quiz"}', 2, 15, 2),
  (v_collection_id, 'mcq',
    '{"type": "question", "text": "Quelle federation regroupe les centres de planning familial laiques?", "options": ["FLCPF", "FCPPF", "FAPEO", "UFAPEC"], "correct_indices": [0], "shuffle_options": true}',
    '{"type": "explanation", "text": "La FLCPF (Federation laique des Centres de Planning familial) regroupe les centres laiques."}',
    '[]', '{"planning", "sante", "quiz"}', 2, 15, 3),
  (v_collection_id, 'mcq',
    '{"type": "question", "text": "Quel mouvement d''education permanente est associe au pilier socialiste?", "options": ["PAC (Presence et Action culturelles)", "CIEP MOC", "Enéo", "FEC"], "correct_indices": [0], "shuffle_options": true}',
    '{"type": "explanation", "text": "PAC (Presence et Action culturelles) est le mouvement d''education permanente du monde socialiste."}',
    '[]', '{"pac", "socialiste", "quiz"}', 2, 15, 4),
  (v_collection_id, 'mcq',
    '{"type": "question", "text": "Quelle association travaille sur les questions d''intelligence economique et de veille?", "options": ["GRESEA", "GRIP", "CETRI", "Barricade"], "correct_indices": [0], "shuffle_options": true}',
    '{"type": "explanation", "text": "Le GRESEA (Groupe de Recherche pour une Strategie economique alternative) analyse les enjeux economiques."}',
    '[]', '{"gresea", "economie", "quiz"}', 3, 20, 5);

  -- Collection: Scenarios Intelligence Strategique
  INSERT INTO game_collections (id, game_type_id, slug, title, description, difficulty_level, estimated_minutes, xp_reward, order_index)
  VALUES (
    gen_random_uuid(),
    v_scenario_type_id,
    'scenarios-ie',
    'Scenarios d''Intelligence Strategique',
    'Mettez-vous dans la peau d''un professionnel de l''IE et prenez des decisions strategiques.',
    3,
    20,
    180,
    12
  )
  RETURNING id INTO v_collection_id;

  INSERT INTO game_cards (collection_id, card_type, front_content, back_content, hints, tags, difficulty, points, order_index) VALUES
  (v_collection_id, 'scenario',
    '{"type": "situation", "context": "Vous etes charge de veille pour une association environnementale. Vous decouvrez qu''une entreprise prepare un projet impactant votre territoire.", "scenario": "Vos sources vous indiquent que l''information est confidentielle mais verifiable. Comment procedez-vous?", "choices": [{"id": "a", "text": "Publier immediatement sur les reseaux sociaux pour alerter", "consequence": "negative", "feedback": "Action precipitee. Sans verification, vous risquez la diffamation et la perte de credibilite."}, {"id": "b", "text": "Recouper l''information avec 2-3 sources independantes avant toute action", "consequence": "positive", "feedback": "Bonne pratique! La verification croisee est fondamentale en IE."}, {"id": "c", "text": "Ignorer car l''information est confidentielle", "consequence": "neutral", "feedback": "L''information blanche/grise peut etre utilisee ethiquement."}]}',
    '{"type": "explanation", "text": "En IE, la verification des sources (regle des 2-3 sources) est essentielle avant toute diffusion."}',
    '[]', '{"veille", "verification", "scenario"}', 2, 25, 1),
  (v_collection_id, 'scenario',
    '{"type": "situation", "context": "Vous participez a un colloque professionnel. Une personne inconnue engage la conversation et pose des questions detaillees sur les projets de votre association.", "scenario": "Elle semble tres interessee par vos methodes de financement et partenariats strategiques.", "choices": [{"id": "a", "text": "Repondre poliment mais rester vague sur les details sensibles", "consequence": "positive", "feedback": "Excellente gestion! Courtoisie sans compromettre les informations strategiques."}, {"id": "b", "text": "Partager ouvertement, le reseau c''est le partage", "consequence": "negative", "feedback": "Attention a l''elicitation! Certains collectent des infos sous couvert de networking."}, {"id": "c", "text": "Refuser categoriquement de parler", "consequence": "neutral", "feedback": "Trop defensif. Vous pouvez echanger sans tout reveler."}]}',
    '{"type": "explanation", "text": "L''elicitation est une technique de collecte d''information par conversation apparemment anodine. Restez vigilant!"}',
    '[]', '{"protection", "reseau", "scenario"}', 3, 25, 2),
  (v_collection_id, 'scenario',
    '{"type": "situation", "context": "Votre association souhaite influencer une reforme legislative en cours. Vous avez identifie les parlementaires cles.", "scenario": "Comment structurez-vous votre strategie d''influence?", "choices": [{"id": "a", "text": "Preparer un argumentaire solide et demander des rendez-vous officiels", "consequence": "positive", "feedback": "Approche professionnelle et transparente. Base d''un lobbying ethique."}, {"id": "b", "text": "Mobiliser les reseaux sociaux pour faire pression publiquement", "consequence": "neutral", "feedback": "Peut fonctionner mais risque de braquer les decideurs. A combiner avec le dialogue."}, {"id": "c", "text": "Proposer des avantages personnels aux parlementaires", "consequence": "negative", "feedback": "Corruption! Totalement contraire a l''ethique et illegal."}]}',
    '{"type": "explanation", "text": "Le lobbying ethique repose sur la transparence, l''argumentation factuelle et le dialogue respectueux."}',
    '[]', '{"influence", "lobbying", "scenario"}', 3, 25, 3);

  -- Collection: Association Concepts Politiques
  INSERT INTO game_collections (id, game_type_id, slug, title, description, difficulty_level, estimated_minutes, xp_reward, order_index)
  VALUES (
    gen_random_uuid(),
    v_matching_type_id,
    'concepts-politiques-matching',
    'Associer les Concepts Politiques',
    'Reliez chaque concept a sa definition pour maitriser le vocabulaire politique belge.',
    2,
    12,
    100,
    13
  )
  RETURNING id INTO v_collection_id;

  INSERT INTO game_cards (collection_id, card_type, front_content, back_content, hints, tags, difficulty, points, order_index) VALUES
  (v_collection_id, 'matching',
    '{"type": "pairs", "instruction": "Associez chaque pilier belge a sa description", "left_items": [{"id": "a", "text": "Pilier catholique"}, {"id": "b", "text": "Pilier liberal"}, {"id": "c", "text": "Pilier socialiste"}], "right_items": [{"id": "1", "text": "Emanciper la classe ouvriere"}, {"id": "2", "text": "Liberte individuelle et economique"}, {"id": "3", "text": "Traditions et valeurs chretiennes"}], "correct_pairs": {"a": "3", "b": "2", "c": "1"}}',
    '{"type": "explanation", "text": "Les trois piliers historiques belges ont structure la societe du 19e au 20e siecle."}',
    '[]', '{"pilarisation", "belgique", "matching"}', 2, 20, 1),
  (v_collection_id, 'matching',
    '{"type": "pairs", "instruction": "Associez chaque pouvoir a sa fonction", "left_items": [{"id": "a", "text": "Pouvoir legislatif"}, {"id": "b", "text": "Pouvoir executif"}, {"id": "c", "text": "Pouvoir judiciaire"}], "right_items": [{"id": "1", "text": "Faire respecter les normes juridiques"}, {"id": "2", "text": "Adopter les lois"}, {"id": "3", "text": "Mettre les lois en oeuvre"}], "correct_pairs": {"a": "2", "b": "3", "c": "1"}}',
    '{"type": "explanation", "text": "La separation des pouvoirs est un principe fondamental de l''Etat de droit."}',
    '[]', '{"pouvoirs", "etat", "matching"}', 1, 15, 2),
  (v_collection_id, 'matching',
    '{"type": "pairs", "instruction": "Associez chaque date a son evenement", "left_items": [{"id": "a", "text": "1830"}, {"id": "b", "text": "1948"}, {"id": "c", "text": "1958"}], "right_items": [{"id": "1", "text": "Pacte scolaire"}, {"id": "2", "text": "Suffrage feminin"}, {"id": "3", "text": "Independance belge"}], "correct_pairs": {"a": "3", "b": "2", "c": "1"}}',
    '{"type": "explanation", "text": "Ces trois dates sont des jalons majeurs de l''histoire politique belge."}',
    '[]', '{"histoire", "dates", "matching"}', 2, 20, 3);

END $$;
