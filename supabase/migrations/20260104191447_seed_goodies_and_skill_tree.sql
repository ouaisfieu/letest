/*
  # Seed Goodies (Hacker Tips) and Skill Tree Nodes

  1. Goodies Content
    - EXIF data tutorial
    - Steganography basics
    - File compression tips
    - Network basics
    - Encryption fundamentals
    - And more from easy to expert

  2. Skill Tree Structure
    - Multiple learning paths with branching nodes
*/

-- Insert goodies (hacker tutorials)
INSERT INTO goodies (slug, title, category, difficulty, short_description, content, tags, xp_reward, estimated_minutes, order_index) VALUES
  ('exif-metadata-basics', 'Les donnees EXIF : ce que vos photos revelent', 'metadata', 1,
   'Decouvrez les metadonnees cachees dans vos images',
   '{
     "intro": "Chaque photo numerique contient des informations invisibles appelees metadonnees EXIF. Ces donnees peuvent reveler beaucoup plus que vous ne le pensez.",
     "sections": [
       {
         "title": "Qu est-ce que l EXIF ?",
         "content": "EXIF signifie Exchangeable Image File Format. Ces donnees sont automatiquement enregistrees par votre appareil photo ou smartphone lors de chaque prise de vue.",
         "type": "text"
       },
       {
         "title": "Donnees typiquement stockees",
         "content": "- Date et heure exacte de la prise de vue\n- Modele de l appareil\n- Parametres (ouverture, vitesse, ISO)\n- Coordonnees GPS (si active)\n- Orientation de l image\n- Logiciel de retouche utilise",
         "type": "list"
       },
       {
         "title": "Pourquoi c est important",
         "content": "En intelligence economique, analyser les EXIF peut reveler l origine d un document, verifier son authenticite, ou identifier des patterns.",
         "type": "text"
       },
       {
         "title": "Comment voir les EXIF",
         "content": "1. Windows : Clic droit > Proprietes > Details\n2. Mac : Ouvrir avec Apercu > Outils > Afficher l inspecteur\n3. En ligne : exifdata.com ou jeffreys exif viewer\n4. Commande : exiftool nomfichier.jpg",
         "type": "steps"
       },
       {
         "title": "Conseil de securite",
         "content": "Avant de partager une photo, supprimez les EXIF sensibles. La plupart des reseaux sociaux le font automatiquement, mais pas tous !",
         "type": "warning"
       }
     ],
     "practice": "Telechargez une de vos photos et examinez ses metadonnees. Vous serez surpris !",
     "resources": ["https://exiftool.org/", "https://www.verexif.com/"]
   }',
   ARRAY['exif', 'metadata', 'photos', 'privacy'],
   15, 10, 1),

  ('steganography-hidden-messages', 'Steganographie : cacher un message dans une image', 'steganography', 3,
   'L art de dissimuler des informations dans des fichiers anodins',
   '{
     "intro": "La steganographie est l art de cacher des informations dans d autres fichiers sans que cela soit detectable. Contrairement au chiffrement qui rend les donnees illisibles, la stegano les rend invisibles.",
     "sections": [
       {
         "title": "Le principe",
         "content": "Une image est composee de millions de pixels. Chaque pixel a une valeur de couleur. En modifiant legerement ces valeurs (le bit le moins significatif), on peut cacher des donnees sans changement visible.",
         "type": "text"
       },
       {
         "title": "Exemple simple avec une image",
         "content": "Un pixel rouge peut avoir la valeur 11111110 (254). Si on change le dernier bit en 11111111 (255), la difference est invisible a l oeil nu, mais on a encode 1 bit d information.",
         "type": "code"
       },
       {
         "title": "Outils pour debuter",
         "content": "- OpenStego (gratuit, multiplateforme)\n- Steghide (ligne de commande Linux)\n- SilentEye (interface graphique)\n- Online : futureboy.us/stegano/encinput.html",
         "type": "list"
       },
       {
         "title": "Exemple pratique avec Steghide",
         "content": "# Cacher un message\nsteghide embed -cf image.jpg -ef secret.txt\n\n# Extraire le message\nsteghide extract -sf image.jpg",
         "type": "code"
       },
       {
         "title": "Detection",
         "content": "Des outils comme StegExpose ou zsteg peuvent detecter la presence de donnees cachees en analysant les anomalies statistiques dans les fichiers.",
         "type": "text"
       },
       {
         "title": "Usage ethique",
         "content": "La steganographie a des usages legitimes : protection de droits d auteur (watermarking), communication securisee pour journalistes/activistes dans des pays restrictifs.",
         "type": "warning"
       }
     ],
     "practice": "Utilisez OpenStego pour cacher un message texte dans une image, puis envoyez-la a un ami et voyez s il peut la detecter.",
     "resources": ["https://github.com/syvaidya/openstego", "https://github.com/zed-0xff/zsteg"]
   }',
   ARRAY['steganography', 'security', 'hidden', 'images'],
   30, 20, 2),

  ('image-compression-guide', 'Compresser ses images intelligemment', 'optimization', 1,
   'Reduire la taille de vos fichiers sans perdre en qualite',
   '{
     "intro": "Les images non compressees peuvent peser plusieurs megaoctets. Apprenez a les optimiser pour le web et le stockage.",
     "sections": [
       {
         "title": "Formats et leurs usages",
         "content": "- JPEG : Photos, images complexes (compression avec perte)\n- PNG : Logos, texte, transparence (sans perte)\n- WebP : Le meilleur des deux mondes (moderne)\n- AVIF : Nouvelle generation, compression superieure",
         "type": "list"
       },
       {
         "title": "Outils recommandes",
         "content": "En ligne :\n- TinyPNG / TinyJPG (excellent)\n- Squoosh.app (Google, tres complet)\n- Compressor.io\n\nLogiciels :\n- ImageOptim (Mac)\n- FileOptimizer (Windows)\n- jpegoptim, pngquant (CLI)",
         "type": "list"
       },
       {
         "title": "Regles de base",
         "content": "1. Redimensionnez d abord (pas besoin de 4000px pour le web)\n2. Qualite JPEG : 70-85% est souvent suffisant\n3. Supprimez les metadonnees inutiles\n4. Utilisez le format adapte au contenu",
         "type": "steps"
       },
       {
         "title": "Compression par lot en ligne de commande",
         "content": "# Avec ImageMagick\nmogrify -quality 80 -resize 1920x1080\\> *.jpg\n\n# Avec jpegoptim\njpegoptim -m80 --strip-all *.jpg",
         "type": "code"
       },
       {
         "title": "Pourquoi c est important",
         "content": "Images lourdes = site lent = mauvais SEO = visiteurs frustres. Sur mobile, chaque Ko compte !",
         "type": "warning"
       }
     ],
     "practice": "Prenez 5 photos de votre telephone et compressez-les avec Squoosh. Comparez la taille avant/apres.",
     "resources": ["https://squoosh.app/", "https://tinypng.com/"]
   }',
   ARRAY['compression', 'images', 'optimization', 'web'],
   15, 8, 3),

  ('terminal-basics', 'Le terminal : votre meilleur ami', 'terminal', 2,
   'Maitrisez les commandes de base pour automatiser vos taches',
   '{
     "intro": "Le terminal peut sembler intimidant, mais c est un outil incroyablement puissant. Quelques commandes suffisent pour devenir plus efficace.",
     "sections": [
       {
         "title": "Commandes de navigation",
         "content": "pwd - Affiche le repertoire actuel\nls - Liste les fichiers\ncd - Change de repertoire\nmkdir - Cree un dossier\nrm - Supprime (attention !)",
         "type": "code"
       },
       {
         "title": "Manipulation de fichiers",
         "content": "cp source dest - Copie\nmv source dest - Deplace/Renomme\ncat fichier - Affiche le contenu\nhead/tail - Debut/Fin du fichier\ngrep motif fichier - Recherche",
         "type": "code"
       },
       {
         "title": "Astuces de productivite",
         "content": "- Tab : Autocompletion\n- Fleche haut : Historique\n- Ctrl+C : Annuler\n- Ctrl+R : Recherche dans l historique\n- !! : Repete la derniere commande",
         "type": "list"
       },
       {
         "title": "Pipes et redirections",
         "content": "# Enchainer des commandes\ncat fichier.txt | grep \"motif\" | wc -l\n\n# Sauvegarder la sortie\nls -la > liste.txt\n\n# Ajouter a un fichier\necho \"nouveau\" >> fichier.txt",
         "type": "code"
       }
     ],
     "practice": "Ouvrez un terminal et naviguez dans vos dossiers avec cd et ls. Creez un dossier test avec mkdir.",
     "resources": ["https://explainshell.com/", "https://tldr.sh/"]
   }',
   ARRAY['terminal', 'cli', 'bash', 'productivity'],
   25, 15, 4),

  ('osint-basics', 'OSINT : la recherche en sources ouvertes', 'osint', 2,
   'Techniques de recherche avancee sur le web',
   '{
     "intro": "L OSINT (Open Source Intelligence) consiste a collecter des informations a partir de sources publiques. Un skill essentiel en intelligence economique.",
     "sections": [
       {
         "title": "Google Dorks",
         "content": "site:example.com - Limite a un site\nfiletype:pdf - Type de fichier\nintitle:\"mot\" - Dans le titre\ninurl:admin - Dans l URL\n\"phrase exacte\" - Recherche exacte",
         "type": "code"
       },
       {
         "title": "Outils OSINT",
         "content": "- Maltego : Visualisation de relations\n- theHarvester : Collecte d emails/sous-domaines\n- Shodan : Moteur pour objets connectes\n- Wayback Machine : Archives du web\n- Social Searcher : Recherche reseaux sociaux",
         "type": "list"
       },
       {
         "title": "Verification d images",
         "content": "1. Google Images (recherche inversee)\n2. TinEye.com\n3. Yandex Images (souvent plus efficace)\n4. FotoForensics (analyse de manipulation)",
         "type": "steps"
       },
       {
         "title": "Ethique et legalite",
         "content": "L OSINT utilise des sources publiques, mais respectez la vie privee. Ne harcelez jamais. Verifiez la legalite dans votre juridiction.",
         "type": "warning"
       }
     ],
     "practice": "Utilisez les Google Dorks pour trouver des PDFs publics sur le site d une organisation que vous connaissez.",
     "resources": ["https://osintframework.com/", "https://start.me/p/DPYPMz/the-ultimate-osint-collection"]
   }',
   ARRAY['osint', 'recherche', 'investigation', 'google'],
   30, 20, 5),

  ('password-security', 'Securite des mots de passe', 'security', 1,
   'Protegez vos comptes efficacement',
   '{
     "intro": "Un mot de passe faible est la premiere cause de piratage. Apprenez a creer et gerer des mots de passe robustes.",
     "sections": [
       {
         "title": "Ce qui rend un mot de passe fort",
         "content": "- Longueur : minimum 12 caracteres (16+ ideal)\n- Complexite : majuscules, minuscules, chiffres, symboles\n- Unicite : different pour chaque compte\n- Imprevisible : pas de mots du dictionnaire ou dates",
         "type": "list"
       },
       {
         "title": "La methode phrase de passe",
         "content": "Plutot que \"P@ssw0rd!\" (faible malgre les symboles), utilisez :\n\"MonChatMangeDesPates2024!\" ou\n\"4-mots-aleatoires-ici\" (methode diceware)",
         "type": "text"
       },
       {
         "title": "Gestionnaires de mots de passe",
         "content": "Indispensables :\n- Bitwarden (gratuit, open source)\n- 1Password (payant, excellent)\n- KeePassXC (local, open source)\n\nN utilisez JAMAIS le meme mot de passe partout !",
         "type": "list"
       },
       {
         "title": "Double authentification (2FA)",
         "content": "Activez le 2FA partout ou c est possible. Preferez une app (Aegis, Authy) aux SMS qui peuvent etre interceptes.",
         "type": "warning"
       }
     ],
     "practice": "Installez Bitwarden et migrez vos 5 comptes les plus importants vers des mots de passe uniques.",
     "resources": ["https://bitwarden.com/", "https://haveibeenpwned.com/"]
   }',
   ARRAY['security', 'passwords', '2fa', 'protection'],
   20, 12, 6),

  ('network-basics', 'Comprendre les reseaux', 'network', 3,
   'IP, DNS, ports : les bases pour comprendre internet',
   '{
     "intro": "Pour analyser le web et proteger ses communications, il faut comprendre comment les reseaux fonctionnent.",
     "sections": [
       {
         "title": "Adresses IP",
         "content": "Chaque appareil sur internet a une adresse IP.\n- IPv4 : 192.168.1.1 (4 milliards d adresses)\n- IPv6 : 2001:0db8:... (quasi illimite)\n- Votre IP publique vs IP locale",
         "type": "text"
       },
       {
         "title": "DNS : l annuaire d internet",
         "content": "Le DNS traduit les noms de domaine en IP.\nexample.com -> 93.184.216.34\n\nCommandes utiles :\nnslookup example.com\ndig example.com",
         "type": "code"
       },
       {
         "title": "Ports et services",
         "content": "Les ports sont comme des portes numerotees :\n- 80 : HTTP (web)\n- 443 : HTTPS (web securise)\n- 22 : SSH (acces distant)\n- 25 : SMTP (email)",
         "type": "list"
       },
       {
         "title": "Outils d analyse",
         "content": "# Voir les connexions actives\nnetstat -an\n\n# Tracer la route vers un serveur\ntraceroute example.com\n\n# Scanner les ports ouverts\nnmap -sT example.com",
         "type": "code"
       }
     ],
     "practice": "Utilisez whatismyip.com pour voir votre IP publique, puis nslookup pour resoudre un domaine.",
     "resources": ["https://www.cloudflare.com/learning/", "https://nmap.org/"]
   }',
   ARRAY['network', 'ip', 'dns', 'ports'],
   35, 25, 7),

  ('encryption-basics', 'Chiffrement : proteger ses donnees', 'crypto', 4,
   'Les bases de la cryptographie moderne',
   '{
     "intro": "Le chiffrement transforme des donnees lisibles en texte incomprehensible sans la cle. C est la base de la securite numerique.",
     "sections": [
       {
         "title": "Chiffrement symetrique",
         "content": "Une seule cle pour chiffrer et dechiffrer.\n- AES-256 : Standard actuel (tres sur)\n- Probleme : comment partager la cle en securite ?",
         "type": "text"
       },
       {
         "title": "Chiffrement asymetrique",
         "content": "Deux cles : publique (pour chiffrer) et privee (pour dechiffrer).\n- RSA, ECC\n- Utilise pour les certificats HTTPS, signatures",
         "type": "text"
       },
       {
         "title": "Hachage",
         "content": "Transformation irreversible (pas de dechiffrement).\n- SHA-256, bcrypt\n- Utilise pour stocker les mots de passe\n\necho \"texte\" | sha256sum",
         "type": "code"
       },
       {
         "title": "Outils pratiques",
         "content": "- VeraCrypt : Chiffrer des disques/fichiers\n- GPG : Emails chiffres, signatures\n- age : Chiffrement simple moderne\n- Signal : Messages chiffres bout en bout",
         "type": "list"
       }
     ],
     "practice": "Creez un conteneur chiffre avec VeraCrypt pour stocker vos documents sensibles.",
     "resources": ["https://veracrypt.fr/", "https://gnupg.org/"]
   }',
   ARRAY['encryption', 'crypto', 'security', 'privacy'],
   40, 30, 8),

  ('regex-patterns', 'Expressions regulieres : la magie du texte', 'programming', 4,
   'Maitriser les regex pour rechercher et transformer du texte',
   '{
     "intro": "Les expressions regulieres (regex) sont un langage pour decrire des motifs dans le texte. Puissant mais intimidant au debut.",
     "sections": [
       {
         "title": "Caracteres de base",
         "content": ". - N importe quel caractere\n* - 0 ou plus\n+ - 1 ou plus\n? - 0 ou 1\n^ - Debut de ligne\n$ - Fin de ligne",
         "type": "code"
       },
       {
         "title": "Classes de caracteres",
         "content": "[abc] - a, b ou c\n[a-z] - Minuscules\n[0-9] ou \\d - Chiffres\n\\w - Lettres/chiffres\n\\s - Espaces",
         "type": "code"
       },
       {
         "title": "Exemples pratiques",
         "content": "# Email\n[\\w.-]+@[\\w.-]+\\.\\w+\n\n# Telephone FR\n0[1-9]([ .-]?[0-9]{2}){4}\n\n# URL\nhttps?://[\\w./]+",
         "type": "code"
       },
       {
         "title": "Outils pour tester",
         "content": "- regex101.com (explications en temps reel)\n- regexr.com\n- grep, sed, awk en terminal",
         "type": "list"
       }
     ],
     "practice": "Sur regex101.com, creez une regex qui detecte tous les numeros de telephone dans un texte.",
     "resources": ["https://regex101.com/", "https://regexone.com/"]
   }',
   ARRAY['regex', 'programming', 'text', 'automation'],
   35, 25, 9),

  ('web-scraping-intro', 'Web scraping : extraire des donnees du web', 'automation', 5,
   'Automatiser la collecte d informations',
   '{
     "intro": "Le web scraping permet d extraire automatiquement des donnees de sites web. Essentiel pour la veille strategique.",
     "sections": [
       {
         "title": "Outils sans code",
         "content": "- Instant Data Scraper (extension Chrome)\n- Octoparse (interface visuelle)\n- Import.io\n- WebScraper.io",
         "type": "list"
       },
       {
         "title": "Avec Python",
         "content": "import requests\nfrom bs4 import BeautifulSoup\n\npage = requests.get(\"https://example.com\")\nsoup = BeautifulSoup(page.content, \"html.parser\")\n\n# Extraire tous les titres\nfor h2 in soup.find_all(\"h2\"):\n    print(h2.text)",
         "type": "code"
       },
       {
         "title": "Respecter les regles",
         "content": "1. Verifiez robots.txt\n2. Respectez les CGU du site\n3. Limitez le rythme des requetes\n4. Identifiez-vous avec un User-Agent\n5. N extrayez pas de donnees personnelles",
         "type": "steps"
       },
       {
         "title": "Contourner les protections",
         "content": "Certains sites bloquent le scraping. Solutions legales :\n- Rotation de proxies\n- Selenium/Playwright (simule un navigateur)\n- APIs officielles si disponibles",
         "type": "warning"
       }
     ],
     "practice": "Utilisez Instant Data Scraper pour extraire une liste de produits d un site e-commerce.",
     "resources": ["https://scrapy.org/", "https://www.crummy.com/software/BeautifulSoup/"]
   }',
   ARRAY['scraping', 'python', 'automation', 'data'],
   45, 35, 10)
ON CONFLICT (slug) DO NOTHING;

-- Insert skill tree nodes for multiple paths
-- First, get path IDs
DO $$
DECLARE
  veille_path_id uuid;
  analyse_path_id uuid;
  reseau_path_id uuid;
BEGIN
  -- Get or create learning paths
  SELECT id INTO veille_path_id FROM learning_paths WHERE slug = 'veille-strategique' LIMIT 1;
  SELECT id INTO analyse_path_id FROM learning_paths WHERE slug = 'analyse-strategique' LIMIT 1;
  SELECT id INTO reseau_path_id FROM learning_paths WHERE slug = 'reseautage-influence' LIMIT 1;
  
  -- Insert skill tree nodes for Veille Strategique
  IF veille_path_id IS NOT NULL THEN
    INSERT INTO skill_tree_nodes (learning_path_id, slug, title, description, icon, node_type, position_x, position_y, xp_cost)
    VALUES
      (veille_path_id, 'veille-root', 'Initiation a la Veille', 'Point de depart du parcours veille', 'search', 'root', 0, 0, 0),
      (veille_path_id, 'veille-sources', 'Sources d Information', 'Identifier les sources pertinentes', 'database', 'skill', -1, 1, 50),
      (veille_path_id, 'veille-outils', 'Outils de Veille', 'Maitriser les outils automatises', 'settings', 'skill', 1, 1, 50),
      (veille_path_id, 'veille-analyse', 'Analyse des Signaux', 'Interpreter les tendances', 'trending-up', 'skill', 0, 2, 100),
      (veille_path_id, 'veille-diffusion', 'Diffusion Strategique', 'Partager l intelligence', 'share-2', 'milestone', 0, 3, 150),
      (veille_path_id, 'veille-master', 'Maitre Veilleur', 'Expert en veille strategique', 'award', 'mastery', 0, 4, 200)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Insert skill tree nodes for Analyse Strategique
  IF analyse_path_id IS NOT NULL THEN
    INSERT INTO skill_tree_nodes (learning_path_id, slug, title, description, icon, node_type, position_x, position_y, xp_cost)
    VALUES
      (analyse_path_id, 'analyse-root', 'Bases de l Analyse', 'Fondamentaux analytiques', 'brain', 'root', 0, 0, 0),
      (analyse_path_id, 'analyse-data', 'Collecte de Donnees', 'Structurer l information', 'folder', 'skill', -1, 1, 50),
      (analyse_path_id, 'analyse-methods', 'Methodes Analytiques', 'SWOT, PESTEL, Porter...', 'grid', 'skill', 1, 1, 75),
      (analyse_path_id, 'analyse-synthesis', 'Synthese', 'Produire des insights', 'file-text', 'skill', 0, 2, 100),
      (analyse_path_id, 'analyse-decision', 'Aide a la Decision', 'Recommandations strategiques', 'target', 'milestone', 0, 3, 150),
      (analyse_path_id, 'analyse-master', 'Stratege Confirme', 'Expert en analyse strategique', 'crown', 'mastery', 0, 4, 200)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Insert skill tree nodes for Reseautage
  IF reseau_path_id IS NOT NULL THEN
    INSERT INTO skill_tree_nodes (learning_path_id, slug, title, description, icon, node_type, position_x, position_y, xp_cost)
    VALUES
      (reseau_path_id, 'reseau-root', 'Art du Reseau', 'Construire son capital social', 'users', 'root', 0, 0, 0),
      (reseau_path_id, 'reseau-contacts', 'Gestion des Contacts', 'CRM personnel', 'contact', 'skill', -1, 1, 50),
      (reseau_path_id, 'reseau-events', 'Evenementiel', 'Maximiser les rencontres', 'calendar', 'skill', 1, 1, 50),
      (reseau_path_id, 'reseau-online', 'Presence en Ligne', 'LinkedIn, Twitter...', 'globe', 'skill', 0, 2, 75),
      (reseau_path_id, 'reseau-influence', 'Influence', 'Devenir une reference', 'star', 'milestone', 0, 3, 150),
      (reseau_path_id, 'reseau-master', 'Connecteur Expert', 'Maitre du reseautage', 'heart', 'mastery', 0, 4, 200)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- Connect skill tree nodes (set parent relationships)
DO $$
BEGIN
  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'veille-root')
  WHERE slug IN ('veille-sources', 'veille-outils');
  
  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'veille-sources')
  WHERE slug = 'veille-analyse';
  
  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'veille-analyse')
  WHERE slug = 'veille-diffusion';
  
  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'veille-diffusion')
  WHERE slug = 'veille-master';

  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'analyse-root')
  WHERE slug IN ('analyse-data', 'analyse-methods');
  
  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'analyse-data')
  WHERE slug = 'analyse-synthesis';
  
  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'analyse-synthesis')
  WHERE slug = 'analyse-decision';
  
  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'analyse-decision')
  WHERE slug = 'analyse-master';

  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'reseau-root')
  WHERE slug IN ('reseau-contacts', 'reseau-events');
  
  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'reseau-contacts')
  WHERE slug = 'reseau-online';
  
  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'reseau-online')
  WHERE slug = 'reseau-influence';
  
  UPDATE skill_tree_nodes SET parent_node_id = (SELECT id FROM skill_tree_nodes WHERE slug = 'reseau-influence')
  WHERE slug = 'reseau-master';
END $$;
