import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildRecommendPrompt } from '@/lib/prompt';
import type { RecommendRequest, RecommendResponse, ApiError, Recommendation } from '@/lib/types';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

export async function POST(request: NextRequest) {
  // 1. Check API key
  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json<ApiError>(
      { error: 'API_KEY_MISSING', message: '请在 .env.local 中配置 DEEPSEEK_API_KEY' },
      { status: 500 }
    );
  }

  // 2. Parse request
  let body: RecommendRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'UPSTREAM_ERROR', message: '请求格式错误' },
      { status: 400 }
    );
  }

  // 3. Validate required fields
  if (!body.meal) {
    return NextResponse.json<ApiError>(
      { error: 'UPSTREAM_ERROR', message: '请选择餐段' },
      { status: 400 }
    );
  }

  // 4. Call DeepSeek
  const client = new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: DEEPSEEK_BASE_URL,
  });

  try {
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位专业的美食推荐师，输出严格 JSON，不含 markdown 标记。' },
        { role: 'user', content: buildRecommendPrompt(body) },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json<ApiError>(
        { error: 'INVALID_RESPONSE', message: 'AI 没有返回内容，稍后再试' },
        { status: 502 }
      );
    }

    // 5. Parse & validate response
    let parsed: { recommendations: Recommendation[] };
    try {
      // Strip possible markdown code fence
      const cleaned = raw.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json<ApiError>(
        { error: 'INVALID_RESPONSE', message: 'AI 返回格式异常，换组偏好试试' },
        { status: 502 }
      );
    }

    if (!Array.isArray(parsed.recommendations) || parsed.recommendations.length === 0) {
      return NextResponse.json<ApiError>(
        { error: 'INVALID_RESPONSE', message: 'AI 没想出合适的推荐，换组偏好试试' },
        { status: 502 }
      );
    }

    // Add IDs if missing
    const recommendations = parsed.recommendations.map((r, i) => ({
      ...r,
      id: r.id || crypto.randomUUID(),
    }));

    const response: RecommendResponse = {
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    // DeepSeek rate limiting / server errors
    if (msg.includes('rate') || msg.includes('429')) {
      return NextResponse.json<ApiError>(
        { error: 'RATE_LIMITED', message: 'AI 厨师忙不过来了，稍等几秒再试' },
        { status: 429 }
      );
    }
    console.error('DeepSeek API error:', msg);
    return NextResponse.json<ApiError>(
      { error: 'UPSTREAM_ERROR', message: 'AI 服务暂时异常，稍后再试' },
      { status: 502 }
    );
  }
}
