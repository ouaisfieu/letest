/*
  # Seed Recruitment Simulator Data (Fixed)

  1. Job Profiles
    - Developpeur Full Stack
    - Chef de Projet Digital
    - Data Analyst
    - UX/UI Designer
    - DevOps Engineer

  2. Skills per category
  3. Challenges with varying difficulty
*/

-- Insert Skills
INSERT INTO skills (id, name, category, description) VALUES
  ('11111111-1111-1111-1111-111111111101', 'JavaScript', 'technical', 'Programmation JavaScript moderne'),
  ('11111111-1111-1111-1111-111111111102', 'React', 'technical', 'Framework React et son ecosysteme'),
  ('11111111-1111-1111-1111-111111111103', 'SQL', 'technical', 'Requetes et bases de donnees'),
  ('11111111-1111-1111-1111-111111111104', 'Python', 'technical', 'Programmation Python'),
  ('11111111-1111-1111-1111-111111111105', 'API REST', 'technical', 'Conception et consommation APIs'),
  ('11111111-1111-1111-1111-111111111201', 'Analyse de donnees', 'analytical', 'Interpreter et analyser des donnees'),
  ('11111111-1111-1111-1111-111111111202', 'Resolution de problemes', 'analytical', 'Logique et resolution'),
  ('11111111-1111-1111-1111-111111111203', 'Statistiques', 'analytical', 'Concepts statistiques'),
  ('11111111-1111-1111-1111-111111111301', 'Communication ecrite', 'communication', 'Redaction claire et efficace'),
  ('11111111-1111-1111-1111-111111111302', 'Presentation', 'communication', 'Presenter des idees'),
  ('11111111-1111-1111-1111-111111111303', 'Negociation', 'communication', 'Techniques de negociation'),
  ('11111111-1111-1111-1111-111111111401', 'Gestion equipe', 'leadership', 'Manager une equipe'),
  ('11111111-1111-1111-1111-111111111402', 'Planification', 'leadership', 'Organiser et planifier'),
  ('11111111-1111-1111-1111-111111111403', 'Prise de decision', 'leadership', 'Decider efficacement'),
  ('11111111-1111-1111-1111-111111111501', 'Design UI', 'creative', 'Conception interfaces'),
  ('11111111-1111-1111-1111-111111111502', 'UX Research', 'creative', 'Recherche utilisateur'),
  ('11111111-1111-1111-1111-111111111503', 'Prototypage', 'creative', 'Creer des prototypes')
ON CONFLICT (id) DO NOTHING;

-- Insert Job Profiles
INSERT INTO job_profiles (id, name, description, icon, difficulty) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Developpeur Full Stack', 'Concevez et developpez des applications web completes, du frontend au backend. Maitrisez les technologies modernes et les bonnes pratiques.', 'code', 'advanced'),
  ('22222222-2222-2222-2222-222222222202', 'Chef de Projet Digital', 'Pilotez des projets numeriques de A a Z. Coordonnez les equipes, gerez les delais et assurez la satisfaction client.', 'users', 'intermediate'),
  ('22222222-2222-2222-2222-222222222203', 'Data Analyst', 'Analysez les donnees pour en extraire des insights business. Creez des visualisations et des rapports percutants.', 'bar-chart-2', 'intermediate'),
  ('22222222-2222-2222-2222-222222222204', 'UX/UI Designer', 'Creez des experiences utilisateur exceptionnelles. Concevez des interfaces belles, intuitives et accessibles.', 'palette', 'intermediate'),
  ('22222222-2222-2222-2222-222222222205', 'DevOps Engineer', 'Automatisez, deployez et surveillez les infrastructures. Assurez la fiabilite et la scalabilite des systemes.', 'server', 'advanced')
ON CONFLICT (id) DO NOTHING;

-- Link Job Profiles to Skills (FIXED)
INSERT INTO job_profile_skills (job_profile_id, skill_id, required_level) VALUES
  -- Developpeur Full Stack
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 85),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111102', 80),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111103', 70),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111105', 75),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111202', 70),
  -- Chef de Projet Digital
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111301', 80),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111302', 75),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111401', 85),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111402', 90),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111403', 80),
  -- Data Analyst
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 85),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111104', 75),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111201', 90),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111203', 80),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111302', 70),
  -- UX/UI Designer
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111501', 90),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111502', 85),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111503', 80),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111301', 70),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111202', 75),
  -- DevOps Engineer
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111104', 80),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111103', 70),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', 85),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111202', 80),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111402', 75)
ON CONFLICT DO NOTHING;

-- Insert Challenges
INSERT INTO challenges (id, skill_id, title, description, type, difficulty, time_limit, xp_reward, content) VALUES
  -- JavaScript Challenges
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'Les fondamentaux JavaScript', 'Testez vos connaissances sur les bases de JavaScript', 'qcm', 1, NULL, 100, '{"questions": [{"question": "Quel mot-cle declare une variable qui peut etre reassignee ?", "options": ["const", "let", "var", "let ou var"], "correct": 3}, {"question": "Quelle methode ajoute un element a la fin d un tableau ?", "options": ["push()", "pop()", "shift()", "unshift()"], "correct": 0}, {"question": "Que retourne typeof null ?", "options": ["null", "undefined", "object", "boolean"], "correct": 2}]}'),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111101', 'Async/Await Challenge', 'Maitrisez la programmation asynchrone', 'qcm', 3, 120, 250, '{"questions": [{"question": "Que retourne une fonction async ?", "options": ["undefined", "Une Promise", "Le resultat directement", "Un callback"], "correct": 1}, {"question": "Comment gerer les erreurs avec async/await ?", "options": ["if/else", "try/catch", ".catch()", "error()"], "correct": 1}, {"question": "Promise.all() resout quand ?", "options": ["La premiere promise est resolue", "Toutes les promises sont resolues", "Une promise echoue", "Apres un timeout"], "correct": 1}]}'),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111101', 'Algorithme de tri', 'Implementez un algorithme de tri efficace', 'coding', 4, 300, 400, '{"problem": "Ecrivez une fonction qui trie un tableau de nombres en ordre croissant sans utiliser .sort()", "testCases": [{"input": "[3, 1, 4, 1, 5]", "expected": "[1, 1, 3, 4, 5]"}, {"input": "[5, 4, 3, 2, 1]", "expected": "[1, 2, 3, 4, 5]"}], "hints": ["Pensez au bubble sort ou insertion sort", "Comparez les elements adjacents"]}'),
  
  -- React Challenges
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111102', 'React Hooks Essentiels', 'Comprenez les hooks React fondamentaux', 'qcm', 2, NULL, 150, '{"questions": [{"question": "Quel hook permet de gerer etat local ?", "options": ["useEffect", "useState", "useContext", "useReducer"], "correct": 1}, {"question": "useEffect execute par defaut quand ?", "options": ["Jamais", "Une seule fois", "A chaque rendu", "Au demontage"], "correct": 2}, {"question": "Comment eviter les re-renders inutiles ?", "options": ["useMemo/useCallback", "useState", "useEffect", "useRef"], "correct": 0}]}'),
  ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111102', 'Architecture React', 'Concevez une architecture React scalable', 'scenario', 4, 180, 350, '{"scenario": "Vous devez concevoir architecture app e-commerce avec panier, authentification et catalogue produits.", "questions": [{"question": "Quelle approche pour etat global ?", "options": ["Props drilling uniquement", "Context API + useReducer", "Tout dans composant App", "LocalStorage seulement"], "correct": 1}, {"question": "Comment structurer les composants ?", "options": ["Un seul fichier", "Par fonctionnalite (features)", "Par type (components, hooks, utils)", "Aleatoirement"], "correct": 1}]}'),
  
  -- SQL Challenges
  ('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111103', 'Requetes SQL Basiques', 'Maitrisez les requetes SELECT fondamentales', 'qcm', 1, NULL, 100, '{"questions": [{"question": "Quelle clause filtre les resultats ?", "options": ["SELECT", "FROM", "WHERE", "ORDER BY"], "correct": 2}, {"question": "Comment limiter a 10 resultats ?", "options": ["LIMIT 10", "TOP 10", "FIRST 10", "MAX 10"], "correct": 0}, {"question": "GROUP BY est utilise avec ?", "options": ["WHERE", "ORDER BY", "Fonctions agregation", "LIMIT"], "correct": 2}]}'),
  ('33333333-3333-3333-3333-333333333307', '11111111-1111-1111-1111-111111111103', 'Jointures Avancees', 'Maitrisez les differents types de jointures', 'qcm', 3, 90, 250, '{"questions": [{"question": "LEFT JOIN retourne ?", "options": ["Seulement les correspondances", "Tout a gauche + correspondances", "Tout des deux tables", "Rien si pas de correspondance"], "correct": 1}, {"question": "Quelle jointure pour toutes les combinaisons ?", "options": ["INNER JOIN", "CROSS JOIN", "FULL JOIN", "SELF JOIN"], "correct": 1}, {"question": "Comment joindre une table avec elle-meme ?", "options": ["INNER JOIN", "SELF JOIN avec alias", "RECURSIVE", "Impossible"], "correct": 1}]}'),
  
  -- Problem Solving
  ('33333333-3333-3333-3333-333333333308', '11111111-1111-1111-1111-111111111202', 'Logique et Deduction', 'Resolvez des problemes de logique', 'logic', 2, 180, 200, '{"questions": [{"question": "Si A > B et B > C, alors ?", "options": ["A < C", "A = C", "A > C", "On ne peut pas savoir"], "correct": 2}, {"question": "Trouvez le prochain: 2, 6, 12, 20, ?", "options": ["28", "30", "32", "26"], "correct": 1}, {"question": "Un train part a 8h et arrive a 11h30. Duree ?", "options": ["3h", "3h30", "4h", "2h30"], "correct": 1}]}'),
  ('33333333-3333-3333-3333-333333333309', '11111111-1111-1111-1111-111111111202', 'Resolution de Cas', 'Analysez et resolvez un cas business', 'scenario', 4, 300, 400, '{"scenario": "Une startup perd 20% de ses utilisateurs chaque mois. Acquisition coute 50 euros/utilisateur et le revenu moyen est de 10 euros/mois/utilisateur.", "questions": [{"question": "Quel est le probleme principal ?", "options": ["Le cout acquisition", "Le taux de retention", "Le revenu par utilisateur", "Le marketing"], "correct": 1}, {"question": "Quelle metrique ameliorer en priorite ?", "options": ["CAC", "LTV", "Churn rate", "MRR"], "correct": 2}, {"question": "ROI utilisateur sur 6 mois (sans churn) ?", "options": ["10 euros", "60 euros", "20 euros", "-10 euros"], "correct": 0}]}'),
  
  -- Communication ecrite
  ('33333333-3333-3333-3333-333333333310', '11111111-1111-1111-1111-111111111301', 'Redaction Professionnelle', 'Evaluez vos competences en redaction', 'qcm', 2, NULL, 150, '{"questions": [{"question": "Un email professionnel doit etre ?", "options": ["Long et detaille", "Court, clair et actionnable", "Informel et amical", "Sans objet precis"], "correct": 1}, {"question": "La regle des 5W sert a ?", "options": ["Structurer information", "Corriger orthographe", "Formater le texte", "Choisir le destinataire"], "correct": 0}, {"question": "Quel ton pour un rapport incident ?", "options": ["Emotionnel", "Factuel et objectif", "Humoristique", "Vague"], "correct": 1}]}'),
  
  -- Gestion equipe
  ('33333333-3333-3333-3333-333333333311', '11111111-1111-1111-1111-111111111401', 'Leadership Situationnel', 'Adaptez votre style de management', 'scenario', 3, 180, 300, '{"scenario": "Vous managez une equipe de 5 personnes avec des niveaux experience varies. Un nouveau projet urgent arrive.", "questions": [{"question": "Un junior motive mais inexperimente, quel style ?", "options": ["Directif", "Delegatif", "Participatif", "Persuasif"], "correct": 0}, {"question": "Un expert autonome et motive, quel style ?", "options": ["Directif", "Delegatif", "Participatif", "Persuasif"], "correct": 1}, {"question": "Comment gerer un conflit entre deux membres ?", "options": ["Ignorer", "Prendre parti", "Mediation neutre", "Sanctionner les deux"], "correct": 2}]}'),
  
  -- UI Design
  ('33333333-3333-3333-3333-333333333312', '11111111-1111-1111-1111-111111111501', 'Principes de Design UI', 'Maitrisez les fondamentaux du design', 'qcm', 2, NULL, 150, '{"questions": [{"question": "La loi de Fitts concerne ?", "options": ["Les couleurs", "La taille et distance des cibles", "La typographie", "Animation"], "correct": 1}, {"question": "Le ratio de contraste minimum WCAG AA ?", "options": ["2:1", "3:1", "4.5:1", "7:1"], "correct": 2}, {"question": "La regle des 60-30-10 concerne ?", "options": ["Espacement", "Les couleurs", "La typographie", "Les images"], "correct": 1}]}'),
  
  -- UX Research
  ('33333333-3333-3333-3333-333333333313', '11111111-1111-1111-1111-111111111502', 'Methodes UX Research', 'Connaissez les methodes de recherche UX', 'qcm', 2, NULL, 150, '{"questions": [{"question": "Combien utilisateurs pour un test utilisabilite ?", "options": ["1-2", "5-8", "20-30", "100+"], "correct": 1}, {"question": "Un persona est base sur ?", "options": ["Imagination", "Des donnees reelles", "Le client ideal", "Les concurrents"], "correct": 1}, {"question": "Le card sorting sert a ?", "options": ["Tester les couleurs", "Organiser architecture", "Mesurer la performance", "Recruter des testeurs"], "correct": 1}]}'),
  
  -- Planification
  ('33333333-3333-3333-3333-333333333314', '11111111-1111-1111-1111-111111111402', 'Gestion de Projet Agile', 'Maitrisez les methodes agiles', 'qcm', 2, NULL, 150, '{"questions": [{"question": "Duree ideale sprint Scrum ?", "options": ["1 jour", "1-4 semaines", "2-3 mois", "Variable"], "correct": 1}, {"question": "Le Product Owner est responsable de ?", "options": ["Le code", "Le backlog produit", "Les tests", "Infrastructure"], "correct": 1}, {"question": "La velocite mesure ?", "options": ["La vitesse du code", "Les story points par sprint", "Le nombre de bugs", "Le temps de reponse"], "correct": 1}]}'),
  
  -- Python
  ('33333333-3333-3333-3333-333333333315', '11111111-1111-1111-1111-111111111104', 'Python Fondamentaux', 'Testez vos bases Python', 'qcm', 1, NULL, 100, '{"questions": [{"question": "Comment creer une liste vide ?", "options": ["[]", "{}", "()", "list{}"], "correct": 0}, {"question": "Quel operateur pour la division entiere ?", "options": ["/", "//", "%", "**"], "correct": 1}, {"question": "range(5) genere ?", "options": ["1 a 5", "0 a 5", "0 a 4", "1 a 4"], "correct": 2}]}'),
  ('33333333-3333-3333-3333-333333333316', '11111111-1111-1111-1111-111111111104', 'Python Data Science', 'Manipulez les donnees avec Python', 'qcm', 3, 120, 250, '{"questions": [{"question": "Quelle librairie pour les DataFrames ?", "options": ["NumPy", "Pandas", "Matplotlib", "SciPy"], "correct": 1}, {"question": "Comment selectionner une colonne age ?", "options": ["df.age ou df[age]", "df.col(age)", "df->age", "df.get(age)"], "correct": 0}, {"question": "groupby() sert a ?", "options": ["Trier", "Filtrer", "Agreger par groupe", "Joindre"], "correct": 2}]}'),
  
  -- API REST
  ('33333333-3333-3333-3333-333333333317', '11111111-1111-1111-1111-111111111105', 'API REST Principes', 'Comprenez les APIs RESTful', 'qcm', 2, NULL, 150, '{"questions": [{"question": "Quelle methode HTTP pour creer ?", "options": ["GET", "POST", "PUT", "DELETE"], "correct": 1}, {"question": "Code de succes pour creation ?", "options": ["200", "201", "204", "301"], "correct": 1}, {"question": "REST signifie ?", "options": ["Remote State Transfer", "Representational State Transfer", "Request State Transfer", "Resource State Transfer"], "correct": 1}]}'),
  
  -- Data Analysis
  ('33333333-3333-3333-3333-333333333318', '11111111-1111-1111-1111-111111111201', 'Analyse de Donnees', 'Interpretez les donnees correctement', 'scenario', 3, 240, 300, '{"scenario": "Vous analysez les ventes trimestrielles. Q1: 100k, Q2: 120k, Q3: 90k, Q4: 150k. Le concurrent a fait +30% sur annee.", "questions": [{"question": "Croissance annuelle approximative ?", "options": ["20%", "50%", "15%", "-10%"], "correct": 2}, {"question": "Quel trimestre est problematique ?", "options": ["Q1", "Q2", "Q3", "Q4"], "correct": 2}, {"question": "Par rapport au concurrent, vous etes ?", "options": ["Mieux", "Pareil", "Moins bien", "Incomparable"], "correct": 2}]}'),
  
  -- Statistiques
  ('33333333-3333-3333-3333-333333333319', '11111111-1111-1111-1111-111111111203', 'Statistiques Essentielles', 'Maitrisez les concepts stats de base', 'qcm', 2, 120, 200, '{"questions": [{"question": "La mediane de [1, 2, 3, 4, 100] ?", "options": ["22", "3", "50", "4"], "correct": 1}, {"question": "Ecart-type mesure ?", "options": ["La moyenne", "La dispersion", "Le maximum", "La tendance"], "correct": 1}, {"question": "Une correlation de -0.9 indique ?", "options": ["Pas de lien", "Lien positif fort", "Lien negatif fort", "Erreur"], "correct": 2}]}'),
  
  -- Presentation
  ('33333333-3333-3333-3333-333333333320', '11111111-1111-1111-1111-111111111302', 'Art de la Presentation', 'Presentez vos idees efficacement', 'qcm', 2, NULL, 150, '{"questions": [{"question": "Regle 10-20-30 de Guy Kawasaki ?", "options": ["10 slides, 20 min, 30 points", "10 slides, 20 min, police 30", "10 min, 20 slides, 30 mots", "10 idees, 20 exemples, 30 min"], "correct": 1}, {"question": "Commencer une presentation par ?", "options": ["Les details techniques", "Un hook/accroche", "Les conclusions", "Les remerciements"], "correct": 1}, {"question": "Combien idees par slide maximum ?", "options": ["1", "3-5", "10", "Illimite"], "correct": 0}]}'),
  
  -- Prise de decision
  ('33333333-3333-3333-3333-333333333321', '11111111-1111-1111-1111-111111111403', 'Decision Making', 'Prenez des decisions eclairees', 'scenario', 3, 180, 300, '{"scenario": "Vous devez choisir entre 3 fournisseurs. A: moins cher mais delais longs. B: prix moyen, bonne qualite. C: cher mais excellent service.", "questions": [{"question": "Pour un projet urgent, quel choix ?", "options": ["A", "B", "C", "Negocier avec tous"], "correct": 2}, {"question": "Quel critere prioriser pour du long terme ?", "options": ["Prix", "Qualite", "Service", "Tous egalement"], "correct": 1}, {"question": "Comment prendre une decision groupe ?", "options": ["Vote majoritaire", "Consensus apres discussion", "Le chef decide", "Tirage au sort"], "correct": 1}]}'),
  
  -- Negociation
  ('33333333-3333-3333-3333-333333333322', '11111111-1111-1111-1111-111111111303', 'Techniques de Negociation', 'Negociez comme un pro', 'qcm', 3, 120, 250, '{"questions": [{"question": "La BATNA est ?", "options": ["La meilleure offre", "La meilleure alternative", "Le budget maximum", "La tactique"], "correct": 1}, {"question": "Negociation win-win signifie ?", "options": ["Je gagne toujours", "On perd tous les deux", "Les deux parties gagnent", "Compromis forcement"], "correct": 2}, {"question": "Premier a donner un prix ?", "options": ["Avantage", "Desavantage", "Sans importance", "Ca depend"], "correct": 3}]}'),
  
  -- Prototypage
  ('33333333-3333-3333-3333-333333333323', '11111111-1111-1111-1111-111111111503', 'Prototypage Rapide', 'Creez des prototypes efficaces', 'qcm', 2, NULL, 150, '{"questions": [{"question": "Un prototype basse fidelite est ?", "options": ["Interactif et detaille", "Simple et rapide (wireframe)", "Le produit final", "Une maquette imprimee"], "correct": 1}, {"question": "Quel outil pour prototypage rapide ?", "options": ["Photoshop", "Excel", "Figma/Sketch", "Word"], "correct": 2}, {"question": "Objectif principal du prototype ?", "options": ["Impressionner", "Tester et valider", "Documenter", "Vendre"], "correct": 1}]}')
ON CONFLICT (id) DO NOTHING;