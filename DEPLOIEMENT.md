# Guide de Déploiement Vercel

## Étapes de déploiement

### 1. Préparer le repository Git

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. Connecter à Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "Add New Project"
3. Importer votre repository GitHub
4. Vercel détectera automatiquement Vite

### 3. Configuration des variables d'environnement

Dans Vercel -> Settings -> Environment Variables, ajoutez :

**OBLIGATOIRE :**
- `VITE_SUPABASE_URL` = `https://jqxwdklsgzdwubayycyp.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeHdka2xzZ3pkd3ViYXl5Y3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mzg3MzAsImV4cCI6MjA4MzExNDczMH0.PGos6CjQpZTXcUKmCudB2cdBD6bCvmuyPOo-h2zuVv4`

**OPTIONNEL (pour IA avancée) :**
- Dans Supabase Dashboard -> Edge Functions -> Secrets
- Ajouter `OPENAI_API_KEY` avec votre clé OpenAI

### 4. Déployer

Cliquez sur "Deploy" dans Vercel

## Vérifications après déploiement

### Test de base
1. Ouvrir l'URL de déploiement
2. Entrer un nom sur l'écran d'accueil
3. Choisir un métier
4. Commencer une épreuve

### Si page blanche
1. Vérifier la console navigateur (F12 -> Console)
2. Vérifier que les variables d'environnement sont bien définies
3. Re-déployer après ajout des variables

### Si erreur Supabase
- Vérifier que l'URL Supabase est correcte
- Vérifier que la clé ANON est correcte
- Vérifier que les tables existent dans Supabase

### Si IA ne fonctionne pas
- Normal sans `OPENAI_API_KEY`
- L'app utilise des feedbacks pré-programmés
- Tout fonctionne quand même, juste moins personnalisé

## Build local pour tester

```bash
npm run build
npm run preview
```

## Logs de déploiement

Si erreur, vérifier les logs dans Vercel -> Deployments -> Cliquer sur le déploiement -> Logs
