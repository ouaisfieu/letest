import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface InterviewRequest {
  type: 'interview' | 'career-advice' | 'feedback';
  jobTitle: string;
  question?: string;
  answer?: string;
  skills?: { name: string; score: number; required: number }[];
  username?: string;
}

async function callOpenAI(messages: { role: string; content: string }[], maxTokens = 500) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function getInterviewQuestions(jobTitle: string): string[] {
  const commonQuestions = [
    `Pourquoi souhaitez-vous devenir ${jobTitle} ?`,
    `Decrivez un projet dont vous etes particulierement fier.`,
    `Comment gerez-vous le stress et les delais serres ?`,
    `Ou vous voyez-vous dans 5 ans ?`,
    `Quelle est votre plus grande force professionnelle ?`,
  ];

  const jobSpecific: Record<string, string[]> = {
    'Developpeur Full Stack': [
      'Expliquez-moi comment vous aborderiez la conception d\'une nouvelle fonctionnalite.',
      'Comment assurez-vous la qualite de votre code ?',
      'Decrivez une situation ou vous avez du debugger un probleme complexe.',
    ],
    'Chef de Projet Digital': [
      'Comment gerez-vous les conflits au sein d\'une equipe ?',
      'Decrivez votre approche pour prioriser les taches d\'un projet.',
      'Comment communiquez-vous avec des parties prenantes non techniques ?',
    ],
    'Data Analyst': [
      'Comment presentez-vous des donnees complexes a un public non technique ?',
      'Decrivez votre processus d\'analyse de donnees.',
      'Comment validez-vous la qualite de vos donnees ?',
    ],
    'UX/UI Designer': [
      'Comment integrez-vous les retours utilisateurs dans votre design ?',
      'Decrivez votre processus de design du debut a la fin.',
      'Comment equilibrez-vous esthetique et utilisabilite ?',
    ],
    'DevOps Engineer': [
      'Comment abordez-vous la securite dans vos pipelines CI/CD ?',
      'Decrivez une situation ou vous avez ameliore les performances d\'un systeme.',
      'Comment gerez-vous un incident en production ?',
    ],
  };

  const specific = jobSpecific[jobTitle] || [];
  return [...specific, ...commonQuestions].slice(0, 5);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: InterviewRequest = await req.json();
    const { type, jobTitle, question, answer, skills, username } = body;

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured', fallback: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: any = {};

    if (type === 'interview') {
      const questions = getInterviewQuestions(jobTitle);
      result = { questions };
    }

    if (type === 'feedback' && question && answer) {
      const prompt = `Tu es un recruteur experimente pour le poste de ${jobTitle}. 
Analyse cette reponse d'entretien et donne un feedback constructif en francais.

Question: ${question}
Reponse du candidat: ${answer}

Donne:
1. Une note sur 10
2. Les points forts de la reponse (2-3 points)
3. Les axes d'amelioration (2-3 points)
4. Un conseil pour s'ameliorer

Reponds en JSON avec ce format:
{"score": number, "strengths": string[], "improvements": string[], "advice": string}`;

      const aiResponse = await callOpenAI([
        { role: 'system', content: 'Tu es un expert en recrutement. Reponds uniquement en JSON valide.' },
        { role: 'user', content: prompt }
      ]);

      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = { feedback: JSON.parse(jsonMatch[0]) };
        } else {
          result = { feedback: { score: 7, strengths: ['Bonne structure'], improvements: ['Ajouter des exemples'], advice: 'Continuez a pratiquer' } };
        }
      } catch {
        result = { feedback: { score: 7, strengths: ['Bonne structure'], improvements: ['Ajouter des exemples'], advice: 'Continuez a pratiquer' } };
      }
    }

    if (type === 'career-advice' && skills) {
      const skillsSummary = skills.map(s => 
        `${s.name}: ${s.score}% (requis: ${s.required}%) - ${s.score >= s.required ? 'ATTEINT' : 'A DEVELOPPER'}`
      ).join('\n');

      const prompt = `Tu es un conseiller en carriere expert. Analyse ce profil pour le poste de ${jobTitle}.

Candidat: ${username || 'Candidat'}

Competences evaluees:
${skillsSummary}

Donne des conseils personnalises en francais:
1. Resume du profil (2-3 phrases)
2. 3 points forts a valoriser
3. 3 competences prioritaires a developper avec des actions concretes
4. Ressources recommandees (livres, cours, certifications)
5. Conseil motivationnel personnalise

Reponds en JSON:
{"summary": string, "strengths": string[], "priorities": [{"skill": string, "action": string}], "resources": string[], "motivation": string}`;

      const aiResponse = await callOpenAI([
        { role: 'system', content: 'Tu es un expert en orientation professionnelle. Reponds uniquement en JSON valide.' },
        { role: 'user', content: prompt }
      ], 800);

      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = { advice: JSON.parse(jsonMatch[0]) };
        } else {
          result = { advice: generateFallbackAdvice(skills, jobTitle) };
        }
      } catch {
        result = { advice: generateFallbackAdvice(skills, jobTitle) };
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateFallbackAdvice(skills: { name: string; score: number; required: number }[], jobTitle: string) {
  const strengths = skills.filter(s => s.score >= s.required).map(s => s.name);
  const toImprove = skills.filter(s => s.score < s.required).sort((a, b) => (a.required - a.score) - (b.required - b.score));

  return {
    summary: `Votre profil montre des aptitudes interessantes pour le poste de ${jobTitle}. Certaines competences sont deja au niveau requis, d'autres necessitent un approfondissement.`,
    strengths: strengths.slice(0, 3).map(s => `Bonne maitrise de ${s}`),
    priorities: toImprove.slice(0, 3).map(s => ({
      skill: s.name,
      action: `Pratiquez regulierement et suivez des formations en ${s.name}`
    })),
    resources: [
      'Udemy / Coursera pour des cours structures',
      'YouTube pour des tutoriels gratuits',
      'Projets personnels pour la pratique'
    ],
    motivation: 'Chaque expert a ete un debutant. Votre parcours de progression est deja en marche !'
  };
}