/*
  # Seed Game Collections and Cards
  
  1. Content Added
    - 3 flashcard collections covering economic intelligence topics
    - 30+ flashcards with varying difficulty levels
    - Sample MCQ collection
    - Sample matching game collection

  2. Topics Covered
    - Intelligence Economique fundamentals
    - Veille strategique methods
    - Analyse de l'information
*/

-- Get game type IDs
DO $$
DECLARE
  v_flashcard_type_id uuid;
  v_mcq_type_id uuid;
  v_matching_type_id uuid;
  v_collection_id uuid;
BEGIN
  -- Get flashcard type ID
  SELECT id INTO v_flashcard_type_id FROM game_types WHERE slug = 'flashcards';
  SELECT id INTO v_mcq_type_id FROM game_types WHERE slug = 'mcq';
  SELECT id INTO v_matching_type_id FROM game_types WHERE slug = 'matching';

  -- Collection 1: Fondamentaux de l'IE
  INSERT INTO game_collections (id, game_type_id, slug, title, description, difficulty_level, estimated_minutes, xp_reward, order_index)
  VALUES (
    gen_random_uuid(),
    v_flashcard_type_id,
    'ie-fondamentaux',
    'Fondamentaux de l''Intelligence Economique',
    'Maitrisez les concepts de base de l''intelligence economique pour les associations',
    1,
    15,
    100,
    1
  )
  RETURNING id INTO v_collection_id;

  -- Cards for Collection 1
  INSERT INTO game_cards (collection_id, card_type, front_content, back_content, hints, tags, difficulty, points, order_index) VALUES
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce que l''intelligence economique (IE)?", "formatting": "markdown"}',
    '{"type": "answer", "text": "L''intelligence economique est l''ensemble des actions coordonnees de recherche, de traitement et de distribution de l''information utile aux acteurs economiques.", "explanation": "Elle comprend la veille, la protection et l''influence.", "sources": ["Rapport Martre, 1994"]}',
    '["Pensez aux 3 piliers: veille, protection, influence", "C''est une demarche strategique"]',
    '{"ie", "fondamentaux", "definition"}', 1, 10, 1),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Quels sont les 3 piliers de l''intelligence economique?", "formatting": "markdown"}',
    '{"type": "answer", "text": "1. La veille strategique\n2. La protection de l''information\n3. L''influence et le lobbying", "explanation": "Ces trois dimensions forment un cycle vertueux pour la competitivite."}',
    '["V comme Veille", "P comme Protection", "I comme Influence"]',
    '{"ie", "piliers", "strategie"}', 1, 10, 2),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce que la veille strategique?", "formatting": "markdown"}',
    '{"type": "answer", "text": "La veille strategique est un processus continu de collecte et d''analyse d''informations sur l''environnement externe pour anticiper les changements.", "explanation": "Elle permet de detecter les opportunites et les menaces."}',
    '["Surveillance de l''environnement", "Anticipation des changements"]',
    '{"veille", "strategie", "anticipation"}', 1, 10, 3),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Quels types de veille peut-on distinguer?", "formatting": "markdown"}',
    '{"type": "answer", "text": "- Veille concurrentielle\n- Veille technologique\n- Veille reglementaire\n- Veille societale\n- Veille financiere", "explanation": "Chaque type repond a des besoins specifiques d''information."}',
    '["Pensez aux differents aspects de l''environnement"]',
    '{"veille", "types", "classification"}', 2, 15, 4),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce que le cycle du renseignement?", "formatting": "markdown"}',
    '{"type": "answer", "text": "Le cycle du renseignement comprend 4 etapes:\n1. Expression des besoins\n2. Collecte de l''information\n3. Analyse et traitement\n4. Diffusion aux decideurs", "explanation": "C''est un processus iteratif qui s''ameliore continuellement."}',
    '["C''est un cycle en 4 etapes", "Commence par les besoins"]',
    '{"cycle", "renseignement", "methodologie"}', 2, 15, 5),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Quelle est la difference entre information blanche, grise et noire?", "formatting": "markdown"}',
    '{"type": "answer", "text": "- Information blanche: publique et accessible (80%)\n- Information grise: accessible mais difficile a trouver (15%)\n- Information noire: secrete et illegale a obtenir (5%)", "explanation": "L''IE travaille exclusivement avec l''information blanche et grise."}',
    '["Pensez aux niveaux d''accessibilite", "La majorite est blanche"]',
    '{"information", "classification", "ethique"}', 2, 15, 6),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Pourquoi l''IE est-elle importante pour les associations?", "formatting": "markdown"}',
    '{"type": "answer", "text": "L''IE permet aux associations de:\n- Mieux connaitre leur environnement\n- Anticiper les evolutions reglementaires\n- Identifier des sources de financement\n- Renforcer leur credibilite\n- Developper des partenariats strategiques", "explanation": "C''est un levier de professionnalisation du secteur associatif."}',
    '["Pensez aux defis specifiques des associations"]',
    '{"associations", "avantages", "secteur-non-lucratif"}', 1, 10, 7),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce qu''une source primaire vs secondaire?", "formatting": "markdown"}',
    '{"type": "answer", "text": "- Source primaire: information originale, de premiere main (entretiens, observations)\n- Source secondaire: information traitee ou analysee par d''autres (articles, rapports)", "explanation": "Les sources primaires sont plus fiables mais plus couteuses a obtenir."}',
    '["Primaire = original", "Secondaire = deja traite"]',
    '{"sources", "methodologie", "collecte"}', 2, 15, 8);

  -- Collection 2: Veille Pratique
  INSERT INTO game_collections (id, game_type_id, slug, title, description, difficulty_level, estimated_minutes, xp_reward, order_index)
  VALUES (
    gen_random_uuid(),
    v_flashcard_type_id,
    'veille-pratique',
    'Outils et Methodes de Veille',
    'Decouvrez les outils concrets pour mettre en place votre veille strategique',
    2,
    20,
    150,
    2
  )
  RETURNING id INTO v_collection_id;

  -- Cards for Collection 2
  INSERT INTO game_cards (collection_id, card_type, front_content, back_content, hints, tags, difficulty, points, order_index) VALUES
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce qu''un flux RSS et comment l''utiliser pour la veille?", "formatting": "markdown"}',
    '{"type": "answer", "text": "Un flux RSS (Really Simple Syndication) permet de recevoir automatiquement les mises a jour d''un site web. Pour la veille, on agrege plusieurs flux dans un lecteur RSS pour surveiller de nombreuses sources simultanement.", "explanation": "Outils: Feedly, Inoreader, Netvibes"}',
    '["Automatisation de la collecte", "Agregateur de contenu"]',
    '{"rss", "outils", "automatisation"}', 2, 15, 1),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Comment configurer une alerte Google efficace?", "formatting": "markdown"}',
    '{"type": "answer", "text": "1. Utiliser des guillemets pour recherche exacte\n2. Combiner avec operateurs AND/OR\n3. Exclure avec le signe -\n4. Choisir la frequence adaptee\n5. Cibler les sources pertinentes", "explanation": "Exemple: \"intelligence economique\" AND association -commercial"}',
    '["Operateurs booleens", "Frequence de notification"]',
    '{"google-alerts", "outils", "configuration"}', 2, 15, 2),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Quels sont les operateurs booleens courants en recherche?", "formatting": "markdown"}',
    '{"type": "answer", "text": "- AND: les deux termes doivent etre presents\n- OR: l''un ou l''autre terme\n- NOT/-: exclure un terme\n- \"...\": recherche exacte\n- site:: limiter a un site\n- filetype:: type de fichier", "explanation": "Ces operateurs fonctionnent sur Google et la plupart des moteurs."}',
    '["Logique de recherche", "Affiner les resultats"]',
    '{"booleens", "recherche", "methodologie"}', 2, 15, 3),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Comment evaluer la fiabilite d''une source en ligne?", "formatting": "markdown"}',
    '{"type": "answer", "text": "Criteres CRAAP:\n- Currency (actualite)\n- Relevance (pertinence)\n- Authority (autorite)\n- Accuracy (exactitude)\n- Purpose (objectif)", "explanation": "Toujours recouper avec au moins 2 autres sources independantes."}',
    '["Methode CRAAP", "Verification croisee"]',
    '{"fiabilite", "sources", "evaluation"}', 3, 20, 4),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Qu''est-ce que la curation de contenu?", "formatting": "markdown"}',
    '{"type": "answer", "text": "La curation est l''action de selectionner, organiser et partager les contenus les plus pertinents sur un sujet donne. Elle ajoute de la valeur par le tri et la mise en contexte.", "explanation": "Outils: Scoop.it, Paper.li, Pocket"}',
    '["Selection et organisation", "Valeur ajoutee par le tri"]',
    '{"curation", "organisation", "partage"}', 2, 15, 5),
  
  (v_collection_id, 'flashcard',
    '{"type": "question", "text": "Comment organiser une note de veille efficace?", "formatting": "markdown"}',
    '{"type": "answer", "text": "Structure recommandee:\n1. Resume executif (3 lignes max)\n2. Contexte et enjeux\n3. Faits cles chiffres\n4. Analyse et implications\n5. Recommandations\n6. Sources", "explanation": "Adapter le format au public cible et a l''urgence."}',
    '["Structure claire", "Adapte au lecteur"]',
    '{"note-veille", "redaction", "communication"}', 3, 20, 6);

  -- Collection 3: MCQ - Test vos connaissances IE
  INSERT INTO game_collections (id, game_type_id, slug, title, description, difficulty_level, estimated_minutes, xp_reward, order_index)
  VALUES (
    gen_random_uuid(),
    v_mcq_type_id,
    'quiz-ie-debutant',
    'Quiz: Testez vos bases en IE',
    'Evaluez vos connaissances sur les fondamentaux de l''intelligence economique',
    1,
    10,
    75,
    3
  )
  RETURNING id INTO v_collection_id;

  -- MCQ Cards
  INSERT INTO game_cards (collection_id, card_type, front_content, back_content, hints, tags, difficulty, points, order_index) VALUES
  (v_collection_id, 'mcq',
    '{"type": "question", "text": "Quel pourcentage de l''information utile est publiquement accessible?", "options": ["20%", "50%", "80%", "95%"], "correct_indices": [2], "shuffle_options": true}',
    '{"type": "explanation", "text": "80% de l''information utile est de source ouverte (information blanche). C''est pourquoi la veille sur les sources publiques est si importante.", "learn_more_url": "/lessons/sources-information"}',
    '["Majoritairement accessible"]',
    '{"sources", "information", "quiz"}', 1, 10, 1),
  
  (v_collection_id, 'mcq',
    '{"type": "question", "text": "Qui a redige le rapport fondateur de l''IE en France en 1994?", "options": ["Henri Martre", "Alain Juillet", "Bernard Carayon", "Christian Harbulot"], "correct_indices": [0], "shuffle_options": true}',
    '{"type": "explanation", "text": "Henri Martre a preside le groupe de travail qui a produit le rapport \"Intelligence economique et strategie des entreprises\" en 1994, document fondateur de l''IE en France."}',
    '["Rapport de 1994"]',
    '{"histoire", "france", "quiz"}', 2, 15, 2),
  
  (v_collection_id, 'mcq',
    '{"type": "question", "text": "Quelle etape n''appartient PAS au cycle du renseignement?", "options": ["Collecte", "Analyse", "Vente", "Diffusion"], "correct_indices": [2], "shuffle_options": true}',
    '{"type": "explanation", "text": "Le cycle du renseignement comprend: Expression des besoins, Collecte, Analyse/Traitement, Diffusion. La vente n''en fait pas partie."}',
    '["4 etapes dans le cycle"]',
    '{"cycle", "methodologie", "quiz"}', 1, 10, 3),
  
  (v_collection_id, 'mcq',
    '{"type": "question", "text": "Quel outil permet d''agréger automatiquement plusieurs sources d''information?", "options": ["Un tableur Excel", "Un lecteur RSS", "Un traitement de texte", "Une messagerie email"], "correct_indices": [1], "shuffle_options": true}',
    '{"type": "explanation", "text": "Un lecteur RSS (comme Feedly ou Inoreader) permet de centraliser les mises a jour de nombreux sites web automatiquement."}',
    '["Automatisation de la veille"]',
    '{"outils", "rss", "quiz"}', 1, 10, 4),
  
  (v_collection_id, 'mcq',
    '{"type": "question", "text": "Que signifie l''operateur AND dans une recherche booleenne?", "options": ["Les deux termes doivent etre presents", "Un seul terme suffit", "Exclure le terme suivant", "Recherche exacte"], "correct_indices": [0], "shuffle_options": true}',
    '{"type": "explanation", "text": "L''operateur AND (intersection logique) impose que tous les termes relies soient presents dans les resultats."}',
    '["Logique d''intersection"]',
    '{"recherche", "booleens", "quiz"}', 1, 10, 5);

  -- Collection 4: Matching - Associez les concepts
  INSERT INTO game_collections (id, game_type_id, slug, title, description, difficulty_level, estimated_minutes, xp_reward, order_index)
  VALUES (
    gen_random_uuid(),
    v_matching_type_id,
    'association-ie-concepts',
    'Associez les concepts IE',
    'Reliez chaque terme de l''intelligence economique a sa definition',
    2,
    10,
    100,
    4
  )
  RETURNING id INTO v_collection_id;

  -- Matching Cards
  INSERT INTO game_cards (collection_id, card_type, front_content, back_content, hints, tags, difficulty, points, order_index) VALUES
  (v_collection_id, 'matching',
    '{"type": "pairs", "instruction": "Associez chaque type de veille a son objet principal", "left_items": [{"id": "a", "text": "Veille concurrentielle"}, {"id": "b", "text": "Veille technologique"}, {"id": "c", "text": "Veille reglementaire"}, {"id": "d", "text": "Veille societale"}], "right_items": [{"id": "1", "text": "Innovations et brevets"}, {"id": "2", "text": "Lois et normes"}, {"id": "3", "text": "Tendances et opinions"}, {"id": "4", "text": "Actions des concurrents"}], "correct_pairs": {"a": "4", "b": "1", "c": "2", "d": "3"}}',
    '{"type": "explanation", "text": "Chaque type de veille se concentre sur un aspect specifique de l''environnement."}',
    '[]',
    '{"veille", "types", "association"}', 2, 20, 1),
  
  (v_collection_id, 'matching',
    '{"type": "pairs", "instruction": "Associez chaque outil a son usage principal", "left_items": [{"id": "a", "text": "Google Alerts"}, {"id": "b", "text": "Feedly"}, {"id": "c", "text": "Scoop.it"}, {"id": "d", "text": "Pocket"}], "right_items": [{"id": "1", "text": "Aggregation de flux RSS"}, {"id": "2", "text": "Curation de contenu"}, {"id": "3", "text": "Sauvegarde d''articles"}, {"id": "4", "text": "Alertes par mots-cles"}], "correct_pairs": {"a": "4", "b": "1", "c": "2", "d": "3"}}',
    '{"type": "explanation", "text": "Ces outils sont complementaires et peuvent etre combines pour une veille efficace."}',
    '[]',
    '{"outils", "veille", "association"}', 2, 20, 2),
  
  (v_collection_id, 'matching',
    '{"type": "pairs", "instruction": "Associez chaque pilier de l''IE a son objectif", "left_items": [{"id": "a", "text": "Veille"}, {"id": "b", "text": "Protection"}, {"id": "c", "text": "Influence"}], "right_items": [{"id": "1", "text": "Securiser les actifs informationnels"}, {"id": "2", "text": "Anticiper les changements"}, {"id": "3", "text": "Promouvoir ses interets"}], "correct_pairs": {"a": "2", "b": "1", "c": "3"}}',
    '{"type": "explanation", "text": "Les trois piliers de l''IE forment un ensemble coherent pour la competitivite."}',
    '[]',
    '{"piliers", "ie", "association"}', 1, 15, 3);

END $$;
