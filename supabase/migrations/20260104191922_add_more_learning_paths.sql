/*
  # Add More Learning Paths

  Adding diverse learning paths for a rich skill tree experience:
  - Veille Strategique (existing, ensure it exists)
  - Analyse Strategique
  - Reseautage & Influence
  - Communication & Plaidoyer
  - Financement & Partenariats
  - Numerique & Innovation
*/

INSERT INTO learning_paths (slug, title, description, objectives, icon, color, difficulty_level, estimated_hours, order_index, is_published) VALUES
  ('veille-strategique', 'Veille Strategique', 
   'Maitrisez les techniques de veille pour anticiper les evolutions de votre secteur.',
   ARRAY['Identifier les sources pertinentes', 'Automatiser la collecte', 'Analyser les signaux faibles', 'Diffuser l information strategique'],
   'search', 'emerald', 1, 15, 1, true),
  
  ('analyse-strategique', 'Analyse Strategique',
   'Developpez vos capacites d analyse pour eclairer les decisions de votre organisation.',
   ARRAY['Maitriser les outils d analyse', 'Produire des syntheses actionnables', 'Identifier les opportunites', 'Evaluer les risques'],
   'brain', 'blue', 2, 20, 2, true),
  
  ('reseautage-influence', 'Reseautage & Influence',
   'Construisez et animez un reseau professionnel pour amplifier votre impact.',
   ARRAY['Developper son capital social', 'Animer une communaute', 'Creer des alliances strategiques', 'Devenir une reference'],
   'users', 'amber', 2, 12, 3, true),
  
  ('communication-plaidoyer', 'Communication & Plaidoyer',
   'Apprenez a porter vos messages et defendre vos causes efficacement.',
   ARRAY['Structurer un argumentaire', 'Maitriser les canaux de communication', 'Influencer les decideurs', 'Mesurer l impact'],
   'megaphone', 'rose', 3, 18, 4, true),
  
  ('financement-partenariats', 'Financement & Partenariats',
   'Diversifiez vos ressources et creez des partenariats durables.',
   ARRAY['Identifier les financeurs', 'Rediger des dossiers percutants', 'Negocier des partenariats', 'Fideliser les soutiens'],
   'coins', 'cyan', 3, 16, 5, true),
  
  ('numerique-innovation', 'Numerique & Innovation',
   'Explorez les outils numeriques pour innover dans vos pratiques.',
   ARRAY['Comprendre les tendances tech', 'Prototyper des solutions', 'Mesurer avec les donnees', 'Adopter l IA ethiquement'],
   'cpu', 'orange', 2, 14, 6, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  objectives = EXCLUDED.objectives,
  is_published = true;
