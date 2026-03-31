import ZAI from 'z-ai-web-dev-sdk';
import type { ScoredThread } from './scorer';

export async function draftReply(
  thread: ScoredThread,
  businessProfile: {
    name: string;
    description: string;
    valueProposition: string;
    replyTone: string;
    website: string;
  }
): Promise<string> {
  const zai = await ZAI.create();

  const systemPrompt = `You are an experienced Reddit user who genuinely helps people. You work at ${businessProfile.name} but you never pitch or sell. You share knowledge from your experience.

RULES FOR REDDIT REPLIES:
1. NEVER mention your company name or website in the reply
2. NEVER sound like an ad or pitch
3. Share genuine, helpful advice based on real expertise
4. Be conversational, use casual language
5. Keep it concise (2-4 paragraphs max)
6. If relevant, share a perspective that naturally aligns with your expertise in: ${businessProfile.description}
7. Use phrases like "In my experience..." or "What's worked well for us..." to add credibility
8. Tone: ${businessProfile.replyTone}
9. Never use marketing language or buzzwords
10. End with a question to keep the conversation going if appropriate`;

  const userPrompt = `Write a helpful Reddit reply to this post:

Title: ${thread.post.title}

Post content: ${thread.post.selftext}

Subreddit: r/${thread.post.subreddit}

Context: The post mentions these keywords: ${thread.matchedKeywords.join(', ') || 'none'}
${thread.matchedCompetitors.length > 0 ? `Competitor mentioned: ${thread.matchedCompetitors.join(', ')}` : ''}
${thread.intentSignals.length > 0 ? `Buying signals detected: ${thread.intentSignals.join(', ')}` : ''}

Your expertise area: ${businessProfile.valueProposition}

Write a reply that is genuinely helpful and would get upvoted on Reddit. Do NOT mention your company.`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error drafting reply:', error);
    throw error;
  }
}
