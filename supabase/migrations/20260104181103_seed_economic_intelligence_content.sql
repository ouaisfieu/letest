/*
  # Contenu Pedagogique - Intelligence Economique pour le Secteur Associatif
  
  Cette migration insere le contenu educatif complet:
  - 4 parcours d'apprentissage thematiques
  - 20+ modules de formation
  - 60+ lecons detaillees
  - 18 competences a developper
  - 25+ badges a debloquer
*/

-- =====================================================
-- PARCOURS D'APPRENTISSAGE
-- =====================================================

INSERT INTO learning_paths (slug, title, description, objectives, icon, color, difficulty_level, estimated_hours, order_index) VALUES
(
  'fondamentaux-ie',
  'Les Fondamentaux de l''Intelligence Economique',
  'Decouvrez les concepts essentiels de l''intelligence economique adaptes au monde associatif. Ce parcours vous donne les bases pour comprendre, collecter et analyser l''information strategique.',
  ARRAY['Comprendre les enjeux de l''IE pour les associations', 'Maitriser les techniques de veille', 'Analyser l''environnement de votre structure', 'Proteger vos informations sensibles'],
  'compass',
  'emerald',
  1,
  12,
  1
),
(
  'construire-reseau',
  'Construire et Animer son Reseau',
  'Apprenez a identifier, cartographier et mobiliser les acteurs cles de votre ecosysteme. Developpez des partenariats strategiques durables.',
  ARRAY['Cartographier votre ecosysteme', 'Identifier les parties prenantes cles', 'Creer des partenariats gagnant-gagnant', 'Animer une communaute engagee'],
  'users',
  'blue',
  2,
  15,
  2
),
(
  'financement-associatif',
  'Strategies de Financement Associatif',
  'Maitrisez les differentes sources de financement et apprenez a construire un modele economique perenne pour votre association.',
  ARRAY['Diversifier vos sources de financement', 'Rediger des demandes de subventions percutantes', 'Developper le mecenat et les partenariats prives', 'Creer des activites generatrices de revenus'],
  'piggy-bank',
  'amber',
  3,
  20,
  3
),
(
  'influence-plaidoyer',
  'Influence et Plaidoyer',
  'Developpez votre capacite d''influence pour faire avancer votre cause. Maitrisez les techniques de plaidoyer et de communication strategique.',
  ARRAY['Construire un argumentaire percutant', 'Identifier les leviers d''influence', 'Mener des campagnes de plaidoyer', 'Communiquer efficacement sur vos actions'],
  'megaphone',
  'rose',
  4,
  18,
  4
);

-- =====================================================
-- MODULES - PARCOURS FONDAMENTAUX
-- =====================================================

INSERT INTO modules (learning_path_id, slug, title, description, learning_objectives, icon, xp_reward, order_index)
SELECT 
  lp.id,
  m.slug,
  m.title,
  m.description,
  m.objectives,
  m.icon,
  m.xp_reward,
  m.order_index
FROM learning_paths lp
CROSS JOIN (VALUES
  ('fondamentaux-ie', 'introduction-ie', 'Introduction a l''Intelligence Economique', 'Comprendre ce qu''est l''IE et pourquoi elle est cruciale pour les associations', ARRAY['Definir l''intelligence economique', 'Comprendre ses applications associatives', 'Identifier les benefices pour votre structure'], 'lightbulb', 100, 1),
  ('fondamentaux-ie', 'veille-strategique', 'La Veille Strategique', 'Mettre en place un systeme de veille efficace et adapte a vos besoins', ARRAY['Organiser sa veille informationnelle', 'Utiliser les bons outils', 'Traiter et synthetiser l''information'], 'search', 150, 2),
  ('fondamentaux-ie', 'analyse-environnement', 'Analyser son Environnement', 'Maitriser les outils d''analyse strategique pour mieux comprendre votre contexte', ARRAY['Realiser une analyse SWOT', 'Cartographier les parties prenantes', 'Identifier opportunites et menaces'], 'chart-bar', 150, 3),
  ('fondamentaux-ie', 'protection-information', 'Proteger ses Informations', 'Securiser les donnees sensibles de votre association', ARRAY['Identifier les informations sensibles', 'Mettre en place des mesures de protection', 'Sensibiliser les benevoles'], 'shield', 120, 4),
  ('construire-reseau', 'cartographie-acteurs', 'Cartographier les Acteurs', 'Identifier et analyser les acteurs cles de votre ecosysteme', ARRAY['Identifier les parties prenantes', 'Analyser leurs interets et pouvoirs', 'Creer une cartographie visuelle'], 'map', 150, 1),
  ('construire-reseau', 'strategies-partenariat', 'Strategies de Partenariat', 'Construire des partenariats strategiques durables', ARRAY['Identifier les partenaires potentiels', 'Negocier des partenariats gagnant-gagnant', 'Formaliser et suivre les partenariats'], 'handshake', 180, 2),
  ('construire-reseau', 'animation-communaute', 'Animer sa Communaute', 'Engager et fideliser vos parties prenantes', ARRAY['Creer de l''engagement', 'Organiser des evenements federateurs', 'Maintenir le lien dans la duree'], 'heart', 150, 3),
  ('construire-reseau', 'reseaux-institutionnels', 'Naviguer dans les Reseaux Institutionnels', 'Comprendre et utiliser les reseaux d''acteurs publics', ARRAY['Identifier les circuits decisionnels', 'Construire des relations avec les institutions', 'Participer aux espaces de concertation'], 'building', 200, 4),
  ('financement-associatif', 'panorama-financements', 'Panorama des Financements', 'Connaitre toutes les sources de financement disponibles', ARRAY['Identifier les differentes sources', 'Evaluer leur pertinence', 'Construire un mix de financement'], 'wallet', 150, 1),
  ('financement-associatif', 'subventions-publiques', 'Obtenir des Subventions Publiques', 'Maitriser l''art de la demande de subvention', ARRAY['Identifier les appels a projets', 'Rediger un dossier percutant', 'Suivre et justifier les subventions'], 'file-text', 200, 2),
  ('financement-associatif', 'mecenat-partenariats', 'Mecenat et Partenariats Prives', 'Developper des relations avec le secteur prive', ARRAY['Comprendre les motivations des entreprises', 'Construire une offre de partenariat', 'Fideliser les mecenes'], 'briefcase', 180, 3),
  ('financement-associatif', 'modele-economique', 'Construire son Modele Economique', 'Developper des activites generatrices de revenus', ARRAY['Analyser votre potentiel economique', 'Developper des activites rentables', 'Equilibrer mission sociale et viabilite'], 'trending-up', 220, 4),
  ('influence-plaidoyer', 'fondamentaux-plaidoyer', 'Les Fondamentaux du Plaidoyer', 'Comprendre les mecanismes d''influence', ARRAY['Definir ses objectifs de plaidoyer', 'Identifier les cibles et allies', 'Choisir ses strategies'], 'target', 150, 1),
  ('influence-plaidoyer', 'argumentaire-impact', 'Construire un Argumentaire d''Impact', 'Creer des messages percutants', ARRAY['Structurer son argumentaire', 'Utiliser les donnees probantes', 'Adapter son discours aux cibles'], 'message-circle', 180, 2),
  ('influence-plaidoyer', 'campagnes-mobilisation', 'Mener des Campagnes de Mobilisation', 'Organiser des actions collectives efficaces', ARRAY['Planifier une campagne', 'Mobiliser les parties prenantes', 'Mesurer l''impact'], 'zap', 200, 3),
  ('influence-plaidoyer', 'communication-strategique', 'Communication Strategique', 'Maximiser la portee de vos messages', ARRAY['Elaborer une strategie de communication', 'Utiliser les medias efficacement', 'Gerer sa reputation'], 'radio', 180, 4)
) AS m(path_slug, slug, title, description, objectives, icon, xp_reward, order_index)
WHERE lp.slug = m.path_slug;

-- =====================================================
-- LECONS - MODULE INTRODUCTION IE
-- =====================================================

INSERT INTO lessons (module_id, slug, title, content_type, content, summary, key_takeaways, xp_reward, estimated_minutes, order_index)
SELECT 
  m.id,
  l.slug,
  l.title,
  l.content_type,
  l.content::jsonb,
  l.summary,
  l.takeaways,
  l.xp_reward,
  l.minutes,
  l.order_index
FROM modules m
CROSS JOIN (VALUES
  ('introduction-ie', 'qu-est-ce-que-ie', 'Qu''est-ce que l''Intelligence Economique ?', 'article', 
   '{"sections": [{"title": "Definition", "content": "L''intelligence economique (IE) est un ensemble de pratiques visant a collecter, analyser et utiliser l''information strategique pour eclairer la prise de decision. Pour une association, cela signifie comprendre son environnement, anticiper les evolutions et proteger ses informations sensibles."}, {"title": "Les 3 piliers de l''IE", "content": "1. **La veille** : Surveiller son environnement pour detecter les opportunites et les menaces.\n2. **L''analyse** : Transformer l''information brute en connaissance actionnable.\n3. **La protection** : Securiser ses informations strategiques et son savoir-faire."}, {"title": "Pourquoi l''IE pour les associations ?", "content": "Les associations evoluent dans un contexte de plus en plus concurrentiel : concurrence pour les financements, pour l''attention des publics, pour les partenariats. L''IE permet de se differencier et d''agir de maniere strategique."}]}',
   'L''intelligence economique aide les associations a collecter et analyser l''information pour prendre de meilleures decisions strategiques.',
   ARRAY['L''IE repose sur 3 piliers : veille, analyse, protection', 'Elle s''adapte parfaitement au contexte associatif', 'C''est un outil de differenciation strategique'],
   25, 15, 1),
  ('introduction-ie', 'ie-vs-espionnage', 'IE vs Espionnage : les limites ethiques', 'article',
   '{"sections": [{"title": "Une pratique 100% legale", "content": "L''intelligence economique n''a rien a voir avec l''espionnage. Elle repose exclusivement sur des sources ouvertes et des methodes ethiques. Toute l''information utilisee est legalement accessible."}, {"title": "Les sources ouvertes", "content": "- Publications officielles (JOAFE, rapports publics)\n- Presse et medias\n- Sites web et reseaux sociaux\n- Evenements publics et conferences\n- Entretiens et echanges professionnels"}, {"title": "Les limites a respecter", "content": "- Ne jamais se faire passer pour quelqu''un d''autre\n- Respecter la vie privee des personnes\n- Ne pas corrompre ou manipuler\n- Respecter les droits d''auteur et la propriete intellectuelle"}]}',
   'L''IE est une pratique ethique et legale qui utilise uniquement des sources ouvertes.',
   ARRAY['L''IE n''est pas de l''espionnage', 'Seules les sources ouvertes sont utilisees', 'L''ethique est au coeur de la demarche'],
   20, 10, 2),
  ('introduction-ie', 'benefices-association', 'Les benefices concrets pour votre association', 'case_study',
   '{"case": {"title": "L''association Solidarite Locale", "context": "Une petite association de quartier qui peinait a renouveler ses financements et voyait son nombre de benevoles diminuer.", "challenge": "Comment redynamiser la structure et assurer sa perennite ?", "solution": "Mise en place d''une demarche d''IE simple : veille sur les appels a projets, analyse des besoins du quartier, benchmark des associations similaires.", "results": ["3 nouvelles subventions obtenues en 1 an", "Doublement du nombre de benevoles", "Creation de 2 nouveaux partenariats strategiques", "Meilleure visibilite aupres des elus locaux"]}, "reflection_questions": ["Quels sont les principaux defis de votre association ?", "Quelles informations vous manquent pour y repondre ?", "Qui sont vos concurrents ou partenaires potentiels ?"]}',
   'L''IE apporte des benefices tangibles : meilleurs financements, plus de partenariats, meilleure visibilite.',
   ARRAY['L''IE peut transformer une association en difficulte', 'Les resultats sont concrets et mesurables', 'La demarche s''adapte a toutes les tailles de structures'],
   30, 20, 3),
  ('veille-strategique', 'organiser-veille', 'Organiser sa veille informationnelle', 'article',
   '{"sections": [{"title": "Definir ses besoins", "content": "Avant de commencer a veiller, posez-vous les bonnes questions :\n- Quelles decisions devez-vous prendre ?\n- Quelles informations vous manquent ?\n- Qui sont vos publics cibles ?\n- Quels sont vos concurrents/partenaires ?"}, {"title": "Les types de veille", "content": "**Veille sectorielle** : Evolution de votre domaine d''action\n**Veille concurrentielle** : Activites des autres acteurs\n**Veille reglementaire** : Lois et reglements\n**Veille financiere** : Opportunites de financement\n**Veille technologique** : Nouveaux outils et methodes"}, {"title": "Le cycle de la veille", "content": "1. Definir les objectifs\n2. Identifier les sources\n3. Collecter l''information\n4. Analyser et synthetiser\n5. Diffuser aux bonnes personnes\n6. Evaluer et ajuster"}]}',
   'Une veille efficace commence par la definition claire de vos besoins informationnels.',
   ARRAY['Definissez d''abord vos besoins', 'Il existe plusieurs types de veille complementaires', 'La veille suit un cycle en 6 etapes'],
   25, 15, 1),
  ('veille-strategique', 'outils-veille-gratuits', 'Les outils de veille gratuits', 'interactive',
   '{"tools": [{"name": "Google Alerts", "description": "Recevez des notifications par email sur les sujets qui vous interessent", "link": "https://www.google.fr/alerts", "tips": ["Utilisez des mots-cles precis", "Combinez plusieurs alertes", "Choisissez la frequence adaptee"]}, {"name": "Feedly", "description": "Agregateur de flux RSS pour suivre vos sources favorites", "link": "https://feedly.com", "tips": ["Organisez vos sources par categories", "Utilisez les filtres pour prioriser", "Partagez les articles interessants"]}, {"name": "Mention", "description": "Surveillez ce qui se dit sur vous sur le web et les reseaux sociaux", "link": "https://mention.com", "tips": ["Configurez des alertes sur votre nom", "Surveillez vos concurrents", "Repondez rapidement aux mentions"]}, {"name": "Talkwalker Alerts", "description": "Alternative a Google Alerts plus complete", "link": "https://www.talkwalker.com/alerts", "tips": ["Completez Google Alerts", "Surveillez les reseaux sociaux", "Analysez les tendances"]}], "exercise": {"title": "Mettez en place votre premiere alerte", "steps": ["Choisissez un sujet cle pour votre association", "Creez une alerte Google sur ce sujet", "Creez une alerte sur le nom de votre association", "Configurez Feedly avec 5 sources pertinentes"]}}',
   'De nombreux outils gratuits permettent de mettre en place une veille efficace.',
   ARRAY['Google Alerts est un bon point de depart', 'Combinez plusieurs outils pour une couverture complete', 'La pratique reguliere est cle'],
   35, 25, 2),
  ('veille-strategique', 'traiter-information', 'Traiter et synthetiser l''information', 'article',
   '{"sections": [{"title": "Le tri de l''information", "content": "Face au flux d''informations, apprenez a trier efficacement :\n- **Pertinence** : L''info repond-elle a un besoin ?\n- **Fiabilite** : La source est-elle credible ?\n- **Fraicheur** : L''info est-elle a jour ?\n- **Originalite** : Apporte-t-elle quelque chose de nouveau ?"}, {"title": "La synthese", "content": "Une bonne synthese doit :\n- Aller a l''essentiel\n- Etre structuree clairement\n- Inclure les sources\n- Proposer des recommandations\n- Etre adaptee au destinataire"}, {"title": "Le format note de veille", "content": "Structure recommandee :\n1. **Titre accrocheur** : Resume en une phrase\n2. **Faits cles** : 3-5 points essentiels\n3. **Analyse** : Implications pour l''association\n4. **Recommandations** : Actions a envisager\n5. **Sources** : Pour approfondir"}]}',
   'Savoir trier et synthetiser l''information est aussi important que la collecter.',
   ARRAY['Appliquez des criteres de tri rigoureux', 'Adoptez un format de synthese standardise', 'Toujours proposer des recommandations'],
   25, 15, 3)
) AS l(module_slug, slug, title, content_type, content, summary, takeaways, xp_reward, minutes, order_index)
WHERE m.slug = l.module_slug;

-- =====================================================
-- COMPETENCES
-- =====================================================

INSERT INTO competencies (slug, name, category, description, icon, max_level) VALUES
('veille-informationnelle', 'Veille Informationnelle', 'veille', 'Capacite a identifier, collecter et organiser l''information pertinente', 'search', 10),
('analyse-sources', 'Analyse des Sources', 'veille', 'Capacite a evaluer la fiabilite et la pertinence des sources', 'check-circle', 10),
('synthese', 'Synthese', 'analyse', 'Capacite a transformer l''information brute en connaissance actionnable', 'file-text', 10),
('analyse-strategique', 'Analyse Strategique', 'analyse', 'Capacite a utiliser les outils d''analyse (SWOT, PESTEL, etc.)', 'chart-bar', 10),
('cartographie-acteurs', 'Cartographie des Acteurs', 'reseau', 'Capacite a identifier et analyser les parties prenantes', 'map', 10),
('negociation', 'Negociation', 'reseau', 'Capacite a negocier des partenariats gagnant-gagnant', 'handshake', 10),
('animation-reseau', 'Animation de Reseau', 'reseau', 'Capacite a creer et maintenir l''engagement d''une communaute', 'users', 10),
('planification', 'Planification Strategique', 'strategie', 'Capacite a definir et suivre des objectifs strategiques', 'calendar', 10),
('prise-decision', 'Prise de Decision', 'strategie', 'Capacite a prendre des decisions eclairees basees sur l''analyse', 'crosshair', 10),
('communication-ecrite', 'Communication Ecrite', 'communication', 'Capacite a rediger des documents clairs et percutants', 'edit', 10),
('communication-orale', 'Communication Orale', 'communication', 'Capacite a presenter et convaincre a l''oral', 'mic', 10),
('plaidoyer', 'Plaidoyer', 'communication', 'Capacite a defendre une cause et influencer les decisions', 'megaphone', 10),
('recherche-financements', 'Recherche de Financements', 'financement', 'Capacite a identifier les opportunites de financement', 'search', 10),
('redaction-projets', 'Redaction de Projets', 'financement', 'Capacite a rediger des demandes de subventions percutantes', 'file-plus', 10),
('gestion-partenariats', 'Gestion des Partenariats', 'financement', 'Capacite a developper et gerer des partenariats prives', 'briefcase', 10),
('modele-economique', 'Modele Economique', 'financement', 'Capacite a construire un modele economique viable', 'trending-up', 10),
('protection-donnees', 'Protection des Donnees', 'veille', 'Capacite a securiser les informations sensibles', 'shield', 10),
('benchmark', 'Benchmark', 'analyse', 'Capacite a analyser et comparer les pratiques du secteur', 'git-compare', 10);

-- =====================================================
-- BADGES / ACCOMPLISSEMENTS
-- =====================================================

INSERT INTO achievements (slug, name, description, icon, category, rarity, xp_reward, unlock_condition) VALUES
('premier-pas', 'Premier Pas', 'Completez votre premiere lecon', 'footprints', 'learning', 'common', 50, '{"type": "lessons_completed", "count": 1}'),
('explorateur', 'Explorateur', 'Completez 10 lecons', 'compass', 'learning', 'common', 100, '{"type": "lessons_completed", "count": 10}'),
('assidu', 'Assidu', 'Connectez-vous 7 jours consecutifs', 'flame', 'streak', 'rare', 150, '{"type": "streak_days", "count": 7}'),
('marathonien', 'Marathonien', 'Connectez-vous 30 jours consecutifs', 'zap', 'streak', 'epic', 500, '{"type": "streak_days", "count": 30}'),
('perfectionniste', 'Perfectionniste', 'Obtenez 100% a un quiz', 'award', 'mastery', 'rare', 200, '{"type": "perfect_quiz", "count": 1}'),
('veilleur', 'Veilleur', 'Completez le module sur la veille strategique', 'search', 'learning', 'common', 150, '{"type": "module_completed", "module": "veille-strategique"}'),
('stratege', 'Stratege', 'Completez le parcours Fondamentaux', 'target', 'learning', 'rare', 300, '{"type": "path_completed", "path": "fondamentaux-ie"}'),
('networker', 'Networker', 'Completez le parcours Reseau', 'users', 'learning', 'rare', 300, '{"type": "path_completed", "path": "construire-reseau"}'),
('fundraiser', 'Fundraiser', 'Completez le parcours Financement', 'piggy-bank', 'learning', 'rare', 300, '{"type": "path_completed", "path": "financement-associatif"}'),
('influenceur', 'Influenceur', 'Completez le parcours Plaidoyer', 'megaphone', 'learning', 'rare', 300, '{"type": "path_completed", "path": "influence-plaidoyer"}'),
('contributeur', 'Contributeur', 'Publiez votre premiere discussion', 'message-square', 'community', 'common', 75, '{"type": "topics_created", "count": 1}'),
('aidant', 'Aidant', 'Une de vos reponses est marquee comme solution', 'check-circle', 'community', 'rare', 200, '{"type": "solutions_given", "count": 1}'),
('mentor', 'Mentor', 'Aidez 10 personnes avec vos reponses', 'heart', 'community', 'epic', 400, '{"type": "solutions_given", "count": 10}'),
('social', 'Social', 'Suivez 5 autres apprenants', 'user-plus', 'community', 'common', 50, '{"type": "following_count", "count": 5}'),
('niveau-5', 'Apprenti', 'Atteignez le niveau 5', 'star', 'mastery', 'common', 100, '{"type": "level_reached", "level": 5}'),
('niveau-10', 'Confirme', 'Atteignez le niveau 10', 'star', 'mastery', 'rare', 250, '{"type": "level_reached", "level": 10}'),
('niveau-20', 'Expert', 'Atteignez le niveau 20', 'crown', 'mastery', 'epic', 500, '{"type": "level_reached", "level": 20}'),
('maitre-ie', 'Maitre de l''IE', 'Completez tous les parcours', 'trophy', 'mastery', 'legendary', 1000, '{"type": "all_paths_completed"}'),
('early-adopter', 'Early Adopter', 'Faites partie des 100 premiers inscrits', 'rocket', 'special', 'legendary', 500, '{"type": "registration_order", "max": 100}'),
('curieux', 'Curieux', 'Consultez 5 ressources complementaires', 'book-open', 'learning', 'common', 50, '{"type": "resources_viewed", "count": 5}'),
('dedicace', 'Dedicace', 'Passez plus de 10 heures sur la plateforme', 'clock', 'streak', 'rare', 200, '{"type": "total_time_hours", "hours": 10}'),
('quiz-master', 'Quiz Master', 'Reussissez 20 quiz', 'check-square', 'mastery', 'epic', 350, '{"type": "quizzes_passed", "count": 20}'),
('defi-quotidien', 'Challenger', 'Completez 7 defis quotidiens', 'calendar-check', 'streak', 'rare', 150, '{"type": "daily_challenges", "count": 7}'),
('certifie', 'Certifie', 'Obtenez votre premiere certification', 'award', 'mastery', 'epic', 500, '{"type": "certifications", "count": 1}'),
('ambassadeur', 'Ambassadeur', 'Parrainez un nouvel utilisateur', 'share-2', 'community', 'rare', 200, '{"type": "referrals", "count": 1}');

-- =====================================================
-- CERTIFICATIONS
-- =====================================================

INSERT INTO certifications (learning_path_id, name, description, requirements)
SELECT 
  lp.id,
  c.name,
  c.description,
  c.requirements::jsonb
FROM learning_paths lp
CROSS JOIN (VALUES
  ('fondamentaux-ie', 'Certificat Fondamentaux IE', 'Atteste de la maitrise des concepts fondamentaux de l''intelligence economique appliquee au secteur associatif', '{"modules_completed": true, "min_quiz_score": 80, "min_level": 5}'),
  ('construire-reseau', 'Certificat Reseautage Strategique', 'Atteste de la capacite a construire et animer un reseau de partenaires', '{"modules_completed": true, "min_quiz_score": 80, "min_level": 8}'),
  ('financement-associatif', 'Certificat Financement Associatif', 'Atteste de la maitrise des strategies de financement pour les associations', '{"modules_completed": true, "min_quiz_score": 80, "min_level": 10}'),
  ('influence-plaidoyer', 'Certificat Influence et Plaidoyer', 'Atteste de la capacite a mener des actions d''influence et de plaidoyer', '{"modules_completed": true, "min_quiz_score": 80, "min_level": 12}')
) AS c(path_slug, name, description, requirements)
WHERE lp.slug = c.path_slug;